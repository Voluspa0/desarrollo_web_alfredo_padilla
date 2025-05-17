from flask import Flask, request, render_template, redirect, url_for, session
from utils.validations import validar_activity
from database import db
from werkzeug.utils import secure_filename
import hashlib
import filetype
import json
import os

UPLOAD_FOLDER = 'static/uploads'

app = Flask(__name__)


app.secret_key = "s3cr3t_k3y"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- Rutas ---

@app.route("/", methods=["GET"])
def index():
    activities = []
    for actividad in db.get_activities(limit=5): 
        comuna = db.get_comuna_by_id(actividad.comuna_id)
        temas = db.get_temas_by_actividad_id(actividad.id)
        temas_str = ", ".join([tema.glosa_otro if tema.tema == 'otro' and tema.glosa_otro else tema.tema for tema in temas])
        fotos = db.get_fotos_by_actividad_id(actividad.id)
        activities.append({
            "dia_hora_inicio": actividad.dia_hora_inicio,
            "dia_hora_termino": actividad.dia_hora_termino,
            "comuna": comuna.nombre,
            "sector": actividad.sector,
            "temas": temas_str,
            "foto": [foto.nombre_archivo for foto in fotos]
        })

    return render_template("index.html", activities=activities)




@app.route("/add_activity", methods=["GET", "POST"])
def add_activity():
    return render_template("add_activity.html")




@app.route("/list_activity", methods=["GET"])
def list_activity():
    page = int(request.args.get("page", 1)) # Obtener el índice de la página actual
    activities_per_page = 5 
    offset = (page - 1) * activities_per_page   # Desplazamiento entre páginas

    total_activities = db.count_activities()
    total_pages = (total_activities + activities_per_page - 1) // activities_per_page

    activities = []
    for actividad in db.get_activities(limit=activities_per_page, offset=offset): 
        comuna = db.get_comuna_by_id(actividad.comuna_id)
        region = db.get_region_by_id(comuna.region_id)
        temas = db.get_temas_by_actividad_id(actividad.id)
        temas_str = ", ".join([tema.glosa_otro if tema.tema == 'otro' and tema.glosa_otro else tema.tema for tema in temas])
        contactar_por = db.get_contactar_por_by_actividad_id(actividad.id)
        contactar_por_str = ", ".join([f"{contacto.nombre}: {contacto.identificador}" for contacto in contactar_por])
        fotos = db.get_fotos_by_actividad_id(actividad.id)
        activities.append({
            "dia_hora_inicio": actividad.dia_hora_inicio,
            "dia_hora_termino": actividad.dia_hora_termino,
            "comuna": comuna.nombre,
            "sector": actividad.sector,
            "temas": temas_str,
            "nombre": actividad.nombre,
            "foto": [foto.nombre_archivo for foto in fotos],
            "email": actividad.email,
            "celular": actividad.celular,
            "descripcion": actividad.descripcion,
            "region": region.nombre,
            "contactar_por": contactar_por_str          
        })

    return render_template(
        "list_activity.html",
        activities=activities,
        page=page,
        total_pages=total_pages
    )




@app.route("/stats", methods=["GET"])
def stats():
    return render_template("stats.html")

@app.route("/post_activity", methods=["POST"])
def post_activity():

    # Obtener los datos del formulario
    nombre = request.form.get("nombre")
    email = request.form.get("email")
    celular = request.form.get("telefono")
    dia_hora_inicio = request.form.get("dia_hora_inicio")
    dia_hora_termino = request.form.get("dia_hora_termino")
    descripcion = request.form.get("descripcion")
    comuna_id = request.form.get("comuna")
    sector = request.form.get("sector")
    temas = request.form.getlist("tema")  
    otro_tema = request.form.get("otro")
    contactar_por = []
    for checkbox in ['whatsapp', 'telegram', 'x', 'instagram', 'tiktok', 'otra']:
        if checkbox in request.form:  
            input_value = request.form.get(f"{checkbox}-id", "").strip()  
            if input_value:  
                contactar_por.append({
                    "nombre": checkbox,
                    "identificador": input_value
                })
    archivos = []
    for _, file in request.files.items():
        if file and file.filename:
            archivos.append(file)

    # Validar los datos
    valid, errors = validar_activity(nombre, 
                         email, 
                         celular, 
                         dia_hora_inicio, 
                         dia_hora_termino, 
                         descripcion, 
                         comuna_id, 
                         sector,
                         temas,
                         contactar_por,
                         archivos, 
                         otro_tema)

    # Si la validación es True, almacenar en las bases de datos
    if valid: 

        # Insertar en la base de datos de actividades
        actividad_id = db.insertar_actividad(
            comuna_id=comuna_id,
            sector=sector,
            nombre=nombre,
            email=email,
            celular=celular,
            dia_hora_inicio=dia_hora_inicio,
            dia_hora_termino=dia_hora_termino,
            descripcion=descripcion,
        )

        actividad_id = db.get_last_activity().id

        # Insertar en la base de datos de temas
        for tema in temas:
            db.insertar_actividad_tema(actividad_id=actividad_id, tema=tema, glosa_otro=otro_tema if tema == "otro" else None)

        # Insertar en la base de datos de contactar por
        for contacto in contactar_por:
            db.insertar_contactar_por(actividad_id=actividad_id, nombre=contacto["nombre"], identificador=contacto["identificador"])

        # Guardar los archivos e insertar en la base de datos de fotos
        for img in archivos:
            _filename = hashlib.sha256(
                secure_filename(img.filename)
                .encode("utf-8")
                ).hexdigest()
            _extension = filetype.guess(img).extension
            img_filename = f"{_filename}.{_extension}"

            filepath = os.path.join(app.config["UPLOAD_FOLDER"], img_filename)

            img.save(filepath)
            db.insertar_archivo(actividad_id=actividad_id,
                        ruta_archivo=filepath,
                        nombre_archivo=img_filename)

        return redirect(url_for("index", message="Actividad agregada exitosamente."))

    else:
        return render_template("add_activity.html", errors=errors)


if __name__ == "__main__":
    app.run(debug=True)
