# app/routers/meta_ahorro.py (CRUD COMPLETO)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import meta_ahorro as meta_ahorro_schemas, usuario as usuario_schemas
from ..crud import crud_meta_ahorro
from ..utils.auth import get_current_active_user

router = APIRouter(
    prefix="/metas",
    tags=["Metas de Ahorro"],
)

# POST /metas/
@router.post("/", response_model=meta_ahorro_schemas.MetaAhorro)
def create_meta_ahorro_for_user(
    meta: meta_ahorro_schemas.MetaAhorroCreate,
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Crea una nueva meta de ahorro asociada al usuario."""
    return crud_meta_ahorro.create_meta_ahorro(db=db, meta_ahorro=meta, usuario_id=current_user.id)

# GET /metas/
@router.get("/", response_model=List[meta_ahorro_schemas.MetaAhorro])
def read_metas_ahorro(
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Obtiene todas las metas de ahorro del usuario autenticado."""
    return crud_meta_ahorro.get_metas_by_usuario(db, usuario_id=current_user.id)

# GET /metas/{meta_id}
@router.get("/{meta_id}", response_model=meta_ahorro_schemas.MetaAhorro)
def read_meta_ahorro(meta_id: int, db: Session = Depends(get_db),
                     current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Obtiene una meta por ID (solo si pertenece al usuario)."""
    db_meta = crud_meta_ahorro.get_meta_ahorro(db, meta_ahorro_id=meta_id)
    if db_meta is None or db_meta.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Meta no encontrada o no pertenece al usuario")
    return db_meta

# PATCH /metas/{meta_id}
@router.patch("/{meta_id}", response_model=meta_ahorro_schemas.MetaAhorro)
def update_meta_ahorro(meta_id: int, meta_in: meta_ahorro_schemas.MetaAhorroUpdate, db: Session = Depends(get_db),
                       current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Actualiza los datos de la meta (nombre, objetivo, fecha límite)."""
    db_meta = crud_meta_ahorro.get_meta_ahorro(db, meta_ahorro_id=meta_id)
    if db_meta is None or db_meta.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Meta no encontrada o no pertenece al usuario")
    
    return crud_meta_ahorro.update_meta_ahorro(db, db_meta=db_meta, meta_ahorro_in=meta_in)

# PATCH /metas/{meta_id}/ahorrar
@router.patch("/{meta_id}/ahorrar", response_model=meta_ahorro_schemas.MetaAhorro)
def add_ahorro_to_meta(
    meta_id: int,
    monto: float,
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Añade un monto al monto_actual de una meta de ahorro."""
    db_meta = crud_meta_ahorro.get_meta_ahorro(db, meta_ahorro_id=meta_id)
    
    if db_meta is None or db_meta.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Meta de ahorro no encontrada o no pertenece al usuario")
    
    if monto <= 0:
        raise HTTPException(status_code=400, detail="El monto a ahorrar debe ser positivo")

    return crud_meta_ahorro.add_ahorro_to_meta(db, meta_ahorro_id=meta_id, monto_a_agregar=monto)

# DELETE /metas/{meta_id}
@router.delete("/{meta_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meta_ahorro(meta_id: int, db: Session = Depends(get_db),
                       current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Elimina una meta por ID (solo si pertenece al usuario)."""
    db_meta = crud_meta_ahorro.get_meta_ahorro(db, meta_ahorro_id=meta_id)
    if db_meta is None or db_meta.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Meta no encontrada o no pertenece al usuario")
        
    crud_meta_ahorro.delete_meta_ahorro(db, meta_ahorro_id=meta_id)
    return