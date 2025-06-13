from sqlalchemy import create_engine, func, Column, Integer, BigInteger, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from markupsafe import escape

# --- Conexión con la Base de Datos ---

DB_NAME = "tarea2"
DB_USERNAME = "cc5002"
DB_PASSWORD = "programacionweb"
DB_HOST = "localhost"
DB_PORT = 3306

DATABASE_URL = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


# --- Modelos ---

class Region(Base):
    __tablename__ = 'region'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)

    comunas = relationship("Comuna", back_populates="region", cascade="all, delete")


class Comuna(Base):
    __tablename__ = 'comuna'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    region_id = Column(Integer, ForeignKey('region.id'), nullable=False)

    region = relationship("Region", back_populates="comunas")
    actividades = relationship("Actividad", back_populates="comuna", cascade="all, delete")


class Actividad(Base):
    __tablename__ = 'actividad'

    id = Column(Integer, primary_key=True, autoincrement=True)
    comuna_id = Column(Integer, ForeignKey('comuna.id'), nullable=False)
    sector = Column(String(100), nullable=True)
    nombre = Column(String(200), nullable=False)
    email = Column(String(100), nullable=False)
    celular = Column(String(15), nullable=True)
    dia_hora_inicio = Column(DateTime, nullable=False)
    dia_hora_termino = Column(DateTime, nullable=True)
    descripcion = Column(String(500), nullable=True)

    comuna = relationship("Comuna", back_populates="actividades")
    fotos = relationship("Foto", back_populates="actividad", cascade="all, delete")
    contactar_por = relationship("ContactarPor", back_populates="actividad", cascade="all, delete")
    actividad_temas = relationship("ActividadTema", back_populates="actividad", cascade="all, delete")
    #comentarios = relationship("Comentario", back_populates="actividad", cascade="all, delete")

class Foto(Base):
    __tablename__ = 'foto'

    id = Column(Integer, primary_key=True, autoincrement=True)
    ruta_archivo = Column(String(300), nullable=False)
    nombre_archivo = Column(String(300), nullable=False)
    actividad_id = Column(Integer, ForeignKey('actividad.id'), nullable=False)

    actividad = relationship("Actividad", back_populates="fotos")


class ContactarPor(Base):
    __tablename__ = 'contactar_por'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(Enum('whatsapp', 'telegram', 'X', 'instagram', 'tiktok', 'otra'), nullable=False)
    identificador = Column(String(150), nullable=False)
    actividad_id = Column(Integer, ForeignKey('actividad.id'), nullable=False)

    actividad = relationship("Actividad", back_populates="contactar_por")


class ActividadTema(Base):
    __tablename__ = 'actividad_tema'

    id = Column(Integer, primary_key=True, autoincrement=True)
    tema = Column(Enum('música', 'deporte', 'ciencias', 'religión', 'política', 'tecnología', 'juegos', 'baile', 'comida', 'otro'), nullable=False)
    glosa_otro = Column(String(15), nullable=True)
    actividad_id = Column(Integer, ForeignKey('actividad.id'), nullable=False)

    actividad = relationship("Actividad", back_populates="actividad_temas")


class Comentario(Base):
    __tablename__ = 'comentario'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(80), nullable=False)
    texto = Column(String(300), nullable=False)
    fecha = Column(DateTime, nullable=False, default=func.now())
    actividad_id = Column(Integer, ForeignKey('actividad.id'), nullable=False)

# --- Obtener información de la Base de Datos ---

def get_actividad_by_id(id):
    session = SessionLocal()
    actividad = session.query(Actividad).filter_by(id=id).first()
    session.close()
    return actividad

def get_last_activity():
    session = SessionLocal()
    actividad = session.query(Actividad).order_by(Actividad.id.desc()).first()
    session.close()
    return actividad

def get_comuna_by_id(id):
    session = SessionLocal()
    comuna = session.query(Comuna).filter_by(id=id).first()
    session.close()
    return comuna

def get_region_by_id(region_id):
    session = SessionLocal()
    region = session.query(Region).filter_by(id=region_id).first()
    session.close()
    return region

def get_temas_by_actividad_id(actividad_id):
    session = SessionLocal()
    temas = session.query(ActividadTema).filter_by(actividad_id=actividad_id).all()
    session.close()
    return temas

def get_contactar_por_by_actividad_id(actividad_id):
    session = SessionLocal()
    contactar_por = session.query(ContactarPor).filter_by(actividad_id=actividad_id).all()
    session.close()
    return contactar_por

def get_fotos_by_actividad_id(actividad_id):
    session = SessionLocal()
    fotos = session.query(Foto).filter_by(actividad_id=actividad_id).all()
    session.close()
    return fotos

def get_activities(limit=5, offset=0):
    session = SessionLocal()
    activities = session.query(Actividad).order_by(Actividad.id.desc()).limit(limit).offset(offset).all()
    session.close()
    return activities

def count_activities():
    session = SessionLocal()
    total = session.query(Actividad).count()
    session.close()
    return total

def get_charts_stats():
    session = SessionLocal()

    # Data para el gráfico 1
    activities = session.query(Actividad.dia_hora_inicio).all()
    actividades_por_dia = {}
    for (fecha_hora,) in activities:
        fecha = fecha_hora.date()
        if fecha not in actividades_por_dia:
            actividades_por_dia[fecha] = 0
        actividades_por_dia[fecha] += 1

    data_chart1 = [
        {"dia": fecha.strftime("%Y-%m-%d"), 
         "cantidad": cantidad}
        for fecha, cantidad in sorted(actividades_por_dia.items())
    ]

    # Data para el gráfico 2
    tipos = session.query(ActividadTema.tema).all()
    actividades_por_tipo = {}
    for (tipo,) in tipos:
        if tipo not in actividades_por_tipo:
            actividades_por_tipo[tipo] = 0
        actividades_por_tipo[tipo] += 1

    data_chart2 = [
        {"tema": tema,
        "cantidad": cantidad} 
        for tema, cantidad in actividades_por_tipo.items()
    ]

    # Data para el gráfico 3
    activities = session.query(Actividad.dia_hora_inicio).all()
    
    mañana = [0]*12
    mediodia = [0]*12
    tarde = [0]*12


    for (dt,) in activities:
        mes = dt.month - 1
        hora = dt.hour
        if hora < 12:
            mañana[mes] += 1
        elif 12 <= hora <= 15:
            mediodia[mes] += 1
        else:
            tarde[mes] += 1

    data_chart3 = {
        "mañana": mañana,
        "mediodia": mediodia,
        "tarde": tarde
    }

    return {
            "actividades_por_dia": data_chart1,
            "actividades_por_tipo": data_chart2,
            "actividades_por_mes_horario": data_chart3
        }


def get_comentarios(actividad_id):
    session = SessionLocal()
    comentarios = session.query(Comentario).filter_by(actividad_id=actividad_id).all()
    session.close()
    return comentarios



# --- Inserciones ---

def insertar_actividad(comuna_id, sector, nombre, email, celular, dia_hora_inicio, dia_hora_termino, descripcion):
    session = SessionLocal()
    actividad = Actividad(
        comuna_id=comuna_id,
        sector=sector,
        nombre=nombre,
        email=email,
        celular=celular,
        dia_hora_inicio=dia_hora_inicio,
        dia_hora_termino=dia_hora_termino,
        descripcion=descripcion
    )
    session.add(actividad)
    session.commit()
    session.close()

def insertar_actividad_tema(actividad_id, tema, glosa_otro=None):
    session = SessionLocal()
    actividad_tema = ActividadTema(
        actividad_id=actividad_id,
        tema=tema,
        glosa_otro=str(escape(glosa_otro)) if tema == 'otro' else None
    )
    session.add(actividad_tema)
    session.commit()
    session.close()

def insertar_contactar_por(actividad_id, nombre, identificador):    
    session = SessionLocal()
    contactar_por = ContactarPor(
        actividad_id=actividad_id,
        nombre=str(escape(nombre)),
        identificador=str(escape(identificador))
    )
    session.add(contactar_por)
    session.commit()
    session.close()

def insertar_archivo(actividad_id, ruta_archivo, nombre_archivo):
    session = SessionLocal()
    foto = Foto(
        actividad_id=actividad_id,
        ruta_archivo=ruta_archivo,
        nombre_archivo=nombre_archivo
    )
    session.add(foto)
    session.commit()
    session.close()   

def insertar_comentario(actividad_id, nombre, texto):    
    session = SessionLocal()
    comentario = Comentario(
        actividad_id=actividad_id,
        nombre=str(escape(nombre)),
        texto=str(escape(texto))
    )
    session.add(comentario)
    session.commit()
    session.close()

