import re
import filetype
from markupsafe import escape
from datetime import datetime

# --- Validaciones ---

def validar_region(region_id):
    return region_id and region_id.isdigit()

def validar_comuna(comuna_id):
    return comuna_id and comuna_id.isdigit()

def validar_nombre(nombre):
    return bool(nombre and 0 < len(escape(nombre).strip()) <= 200)

def validar_email(email):
    regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+(\.[^\s@]+)*$"
    return bool(email and re.match(regex, email))

def validar_telefono(telefono):
    if not telefono:
        return True
    regex = r"^\+\d{3}\.\d{8}$"
    return bool(re.match(regex, telefono))


def validar_fecha_hora(dia_hora_inicio, dia_hora_termino):

    if not dia_hora_inicio:
        return False

    if dia_hora_termino:
        inicio = datetime.fromisoformat(dia_hora_inicio)
        termino = datetime.fromisoformat(dia_hora_termino)
        return termino > inicio
    else:
        return datetime.fromisoformat(dia_hora_inicio) > datetime.now()
    
def validar_contactar_por(contactar_por):

    if not contactar_por:
        return True  

    if len(contactar_por) > 5:
        return False

    for contacto in contactar_por:
        nombre = contacto.get("nombre")
        identificador = contacto.get("identificador")

        if not nombre or not identificador:
            return False

        if not (4 <= len(identificador) <= 50):
            return False

    return True

def validar_tema(temas, otro_tema):
    valid_temas = ['música', 'deporte', 'ciencias', 'religión', 'política', 'tecnología', 'juegos', 'baile', 'comida', 'otro']
    if not temas or not all(tema in valid_temas for tema in temas):
        return False
    if 'otro' in temas and not (otro_tema and len(escape(otro_tema).strip()) >= 3 and len(otro_tema.strip()) <= 15):
        return False
    return True

def validar_fotos(fotos):
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
    ALLOWED_MIMETYPES = {"image/jpeg", "image/png", "image/gif"}
    for foto in fotos:
        if foto is None:
            return False
         
        if foto.filename == "":
            return False

        ftype_guess = filetype.guess(foto)
        if ftype_guess.extension not in ALLOWED_EXTENSIONS:
            return False

        if ftype_guess.mime not in ALLOWED_MIMETYPES:
            return False
    return True

# --- Validación Completa de la Actividad ---

def validar_activity(nombre, email, telefono, dia_hora_inicio, dia_hora_termino, descripcion, comuna_id, sector, temas, contactar_por, fotos, otro_tema):
    errors = []

    if not validar_comuna(comuna_id):
        errors.append("Debe seleccionar una comuna válida.")

    if not validar_nombre(nombre):
        errors.append("Debe ingresar un nombre válido.")

    if not validar_email(email):
        errors.append("Debe ingresar un email válido.")

    if not validar_telefono(telefono):
        errors.append("Debe ingresar un teléfono válido.")

    if not validar_fecha_hora(dia_hora_inicio, dia_hora_termino):
        errors.append("Debe ingresar fechas y horas válidas. La hora de término debe ser posterior a la de inicio.")

    if not validar_contactar_por(contactar_por):
        errors.append("Puede ingresar hasta 5 contactos. Cada contacto debe tener entre 4 y 50 caracteres.")

    if not validar_tema(temas, otro_tema):
        errors.append("Debe seleccionar al menos un tema válido. Si selecciona 'otro', debe especificarlo correctamente.")

    if not validar_fotos(fotos):
        errors.append("Debe subir entre 1 y 5 fotos válidas.")

    descripcion = str(escape(descripcion)) if descripcion else None
    sector = str(escape(sector)) if sector else None

    return len(errors) == 0, errors
