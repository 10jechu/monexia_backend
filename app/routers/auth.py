# app/routers/auth.py (Contenido FINAL y COMPLETO)

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

# Importaciones ABSOLUTAS (corregidas)
from app.database import get_db
from app.core.config import settings 
from app.crud import crud_usuario
from app.utils.auth import authenticate_user, create_access_token, get_password_hash # Importa las funciones del otro archivo

# Importaciones relativas
from ..schemas.token import Token
from ..schemas import usuario as usuario_schemas

# 1. DEFINICIÓN DEL ROUTER
router = APIRouter( 
    prefix="/auth",
    tags=["Autenticación"],
)

# 2. ENDPOINT DE REGISTRO
@router.post("/register", response_model=usuario_schemas.Usuario, status_code=status.HTTP_201_CREATED)
def register_user(user: usuario_schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_user = crud_usuario.get_usuario_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
    
    hashed_password = get_password_hash(user.password)
    user_data = user.model_dump(exclude={"password"})
    user_data["password_hash"] = hashed_password 
    
    return crud_usuario.create_usuario(db=db, user=usuario_schemas.UsuarioCreate(**user_data))

# 3. ENDPOINT DE LOGIN (Obtener Token)
@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}