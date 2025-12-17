# app/database.py (Usa la importación absoluta corregida)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Corregido: Importación absoluta para evitar errores de arranque
from app.core.config import settings 

# -----------------------------------------------------------
# 1. URL DE CONEXIÓN
# -----------------------------------------------------------
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL 

# -----------------------------------------------------------
# 2. CREACIÓN DEL MOTOR (Engine)
# -----------------------------------------------------------
engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

# -----------------------------------------------------------
# 3. CONFIGURACIÓN DE SESIÓN Y BASE
# -----------------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -----------------------------------------------------------
# 4. FUNCIÓN DE DEPENDENCIA (Para FastAPI)
# -----------------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()