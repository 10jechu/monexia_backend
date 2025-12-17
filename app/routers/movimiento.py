# app/routers/movimiento.py (CRUD COMPLETO)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import movimiento as movimiento_schemas, usuario as usuario_schemas
from ..crud import crud_movimiento
from ..utils.auth import get_current_active_user

router = APIRouter(
    prefix="/movimientos",
    tags=["Movimientos"],
)

# POST /movimientos/
@router.post("/", response_model=movimiento_schemas.Movimiento)
def create_movimiento_for_user(
    movimiento: movimiento_schemas.MovimientoCreate,
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Crea un nuevo movimiento asociado al usuario."""
    return crud_movimiento.create_movimiento(db=db, movimiento=movimiento, usuario_id=current_user.id)

# GET /movimientos/
@router.get("/", response_model=List[movimiento_schemas.Movimiento])
def read_movimientos(
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Obtiene todos los movimientos del usuario autenticado."""
    return crud_movimiento.get_movimientos_by_usuario(db, usuario_id=current_user.id)

# GET /movimientos/{movimiento_id}
@router.get("/{movimiento_id}", response_model=movimiento_schemas.Movimiento)
def read_movimiento(movimiento_id: int, db: Session = Depends(get_db),
                    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Obtiene un movimiento por ID (solo si pertenece al usuario)."""
    db_movimiento = crud_movimiento.get_movimiento(db, movimiento_id=movimiento_id)
    if db_movimiento is None or db_movimiento.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado o no pertenece al usuario")
    return db_movimiento

# PATCH /movimientos/{movimiento_id}
@router.patch("/{movimiento_id}", response_model=movimiento_schemas.Movimiento)
def update_movimiento(movimiento_id: int, movimiento_in: movimiento_schemas.MovimientoUpdate, db: Session = Depends(get_db),
                      current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Actualiza un movimiento existente (solo si pertenece al usuario)."""
    db_movimiento = crud_movimiento.get_movimiento(db, movimiento_id=movimiento_id)
    if db_movimiento is None or db_movimiento.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado o no pertenece al usuario")
        
    return crud_movimiento.update_movimiento(db, db_movimiento=db_movimiento, movimiento_in=movimiento_in)

# DELETE /movimientos/{movimiento_id}
@router.delete("/{movimiento_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movimiento(movimiento_id: int, db: Session = Depends(get_db),
                      current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Elimina un movimiento por ID (solo si pertenece al usuario)."""
    db_movimiento = crud_movimiento.get_movimiento(db, movimiento_id=movimiento_id)
    if db_movimiento is None or db_movimiento.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado o no pertenece al usuario")
        
    crud_movimiento.delete_movimiento(db, movimiento_id=movimiento_id)
    return