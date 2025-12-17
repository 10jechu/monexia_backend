# app/schemas/token.py
from pydantic import BaseModel

class Token(BaseModel):
    """Estructura del token de acceso devuelto al iniciar sesión."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Datos contenidos dentro del token (payload decodificado)."""
    email: str | None = None