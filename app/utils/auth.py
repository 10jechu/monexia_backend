# app/utils/auth.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Union 

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Importaciones ABSOLUTAS
from app.core.config import settings 
from app.crud import crud_usuario
from app.database import get_db 
from app.schemas.usuario import Usuario as UsuarioSchema 
from app.models.usuario import Usuario as UserModel 

# Esquema para obtener el token del header (Bearer Token)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Configuración de hashing estable
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============================================
# 1. FUNCIONES BÁSICAS DE HASHING
# ============================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# ============================================
# 2. FUNCIONES DE TOKEN (JWT)
# ============================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    # Aseguramos que el sub esté presente
    if "sub" not in to_encode and "email" in data:
        to_encode["sub"] = data["email"]
        
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None: 
            raise credentials_exception
        return payload 
    except JWTError:
        raise credentials_exception


# ============================================
# 3. FUNCIONES DE AUTENTICACIÓN Y DEPENDENCIAS
# ============================================

def authenticate_user(db: Session, email: str, password: str) -> Union[UserModel, bool]:
    user = crud_usuario.get_usuario_by_email(db, email=email)
    # Importante: Verifica si en tu modelo es 'password_hash' o 'password'
    if not user or not verify_password(password, user.password_hash):
        return False
    return user

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> UserModel:
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    if email is None: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token inválido"
        )
    user = crud_usuario.get_usuario_by_email(db, email=email)
    if user is None: 
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

def get_current_active_user(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    # Asumimos que el modelo tiene el atributo .activo
    if hasattr(current_user, 'activo') and not current_user.activo:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user

def get_current_admin_user(current_user: UserModel = Depends(get_current_active_user)) -> UserModel:
    if current_user.rol != "Administrador": 
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="No tienes permisos de Administrador"
        )
    return current_user