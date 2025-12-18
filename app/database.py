# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Corregido: Importación absoluta para evitar errores de arranque circular
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
    """Generador de sesiones para inyección de dependencias."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()