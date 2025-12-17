# app/core/config.py

from pydantic_settings import BaseSettings
from datetime import timedelta

class Settings(BaseSettings):
    """
    Contiene la configuración de la aplicación (JWT y DB).
    """
    
    # --- 🔑 JWT Settings ---
    SECRET_KEY: str = "TU_CLAVE_SECRETA_SUPER_LARGA_Y_COMPLEJA" # ¡Cámbiala!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 

    # --- 💾 DB Settings ---
    POSTGRES_USER: str = "postgres" 
    POSTGRES_PASS: str = "67001298" # ¡Asegúrate que esta es tu contraseña!
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "finanzas_familiar"
    
    @property
    def DATABASE_URL(self) -> str:
        """Genera la cadena de conexión completa para SQLAlchemy."""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASS}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}?options=-csearch_path%3Dpublic"

settings = Settings()