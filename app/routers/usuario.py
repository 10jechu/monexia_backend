# app/routers/usuario.py (COMPLETO: GET, GET por ID, PATCH, DELETE)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import usuario as usuario_schemas
from ..crud import crud_usuario
from ..utils.auth import get_current_active_user, get_current_admin_user

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"],
)

# GET /usuarios
@router.get("/", response_model=List[usuario_schemas.Usuario])
def read_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
                  current_user: usuario_schemas.Usuario = Depends(get_current_admin_user)):
    """Obtiene una lista de todos los usuarios (requiere rol Admin)."""
    return crud_usuario.get_usuarios(db, skip=skip, limit=limit)

# GET /usuarios/me
@router.get("/me", response_model=usuario_schemas.Usuario)
def read_users_me(current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Obtiene la información del usuario actualmente autenticado."""
    return current_user

# GET /usuarios/{usuario_id}
@router.get("/{usuario_id}", response_model=usuario_schemas.Usuario)
def read_usuario(usuario_id: int, db: Session = Depends(get_db),
                 current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Obtiene un usuario por ID (solo propio o Admin)."""
    db_user = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if db_user.id != current_user.id and current_user.rol != "Administrador":
        raise HTTPException(status_code=403, detail="No tienes permiso")
    return db_user
    
# PATCH /usuarios/{usuario_id}
@router.patch("/{usuario_id}", response_model=usuario_schemas.Usuario)
def update_usuario(usuario_id: int, user_in: usuario_schemas.UsuarioUpdate, db: Session = Depends(get_db),
                   current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Actualiza la información de un usuario (solo propio o Admin)."""
    db_user = crud_usuario.get_usuario(db, usuario_id=usuario_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if db_user.id != current_user.id and current_user.rol != "Administrador":
        raise HTTPException(status_code=403, detail="No tienes permiso para actualizar este perfil")
    
    return crud_usuario.update_usuario(db, db_user=db_user, user_in=user_in)

# DELETE /usuarios/{usuario_id}
@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(usuario_id: int, db: Session = Depends(get_db),
                   current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Elimina un usuario (requiere rol Admin)."""
    if current_user.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden eliminar usuarios")
        
    success = crud_usuario.delete_usuario(db, usuario_id=usuario_id)
    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return