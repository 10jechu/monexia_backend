# app/routers/ingreso.py (CRUD COMPLETO)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import ingreso as ingreso_schemas, usuario as usuario_schemas
from ..crud import crud_ingreso
from ..utils.auth import get_current_active_user

router = APIRouter(
    prefix="/ingresos",
    tags=["Ingresos"],
)

# POST /ingresos/
@router.post("/", response_model=ingreso_schemas.Ingreso)
def create_ingreso_for_user(
    ingreso: ingreso_schemas.IngresoCreate,
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Crea un nuevo ingreso asociado al usuario autenticado."""
    return crud_ingreso.create_ingreso(db=db, ingreso=ingreso, usuario_id=current_user.id)

# GET /ingresos/
@router.get("/", response_model=List[ingreso_schemas.Ingreso])
def read_ingresos(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Obtiene todos los ingresos del usuario autenticado."""
    return crud_ingreso.get_ingresos_by_usuario(db, usuario_id=current_user.id, skip=skip, limit=limit)

# GET /ingresos/{ingreso_id}
@router.get("/{ingreso_id}", response_model=ingreso_schemas.Ingreso)
def read_ingreso(ingreso_id: int, db: Session = Depends(get_db),
                 current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Obtiene un ingreso por ID (solo si pertenece al usuario)."""
    db_ingreso = crud_ingreso.get_ingreso(db, ingreso_id=ingreso_id)
    if db_ingreso is None or db_ingreso.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado o no pertenece al usuario")
    return db_ingreso

# PATCH /ingresos/{ingreso_id}
@router.patch("/{ingreso_id}", response_model=ingreso_schemas.Ingreso)
def update_ingreso(ingreso_id: int, ingreso_in: ingreso_schemas.IngresoUpdate, db: Session = Depends(get_db),
                   current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Actualiza un ingreso existente (solo si pertenece al usuario)."""
    db_ingreso = crud_ingreso.get_ingreso(db, ingreso_id=ingreso_id)
    if db_ingreso is None or db_ingreso.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado o no pertenece al usuario")
        
    return crud_ingreso.update_ingreso(db, db_ingreso=db_ingreso, ingreso_in=ingreso_in)

# DELETE /ingresos/{ingreso_id}
@router.delete("/{ingreso_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingreso(ingreso_id: int, db: Session = Depends(get_db),
                   current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Elimina un ingreso por ID (solo si pertenece al usuario)."""
    db_ingreso = crud_ingreso.get_ingreso(db, ingreso_id=ingreso_id)
    if db_ingreso is None or db_ingreso.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado o no pertenece al usuario")
        
    crud_ingreso.delete_ingreso(db, ingreso_id=ingreso_id)
    return