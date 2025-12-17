# app/routers/gasto_fijo.py (CRUD COMPLETO)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import gasto_fijo as gasto_fijo_schemas, usuario as usuario_schemas
from ..crud import crud_gasto_fijo
from ..utils.auth import get_current_active_user

router = APIRouter(
    prefix="/gastos",
    tags=["Gastos Fijos"],
)

# POST /gastos/
@router.post("/", response_model=gasto_fijo_schemas.GastoFijo)
def create_gasto_fijo_for_user(
    gasto_fijo: gasto_fijo_schemas.GastoFijoCreate,
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Crea un nuevo gasto fijo asociado al usuario autenticado."""
    return crud_gasto_fijo.create_gasto_fijo(db=db, gasto_fijo=gasto_fijo, usuario_id=current_user.id)

# GET /gastos/
@router.get("/", response_model=List[gasto_fijo_schemas.GastoFijo])
def read_gastos_fijos(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Obtiene todos los gastos fijos del usuario autenticado."""
    return crud_gasto_fijo.get_gastos_fijos_by_usuario(db, usuario_id=current_user.id, skip=skip, limit=limit)

# GET /gastos/{gasto_fijo_id}
@router.get("/{gasto_fijo_id}", response_model=gasto_fijo_schemas.GastoFijo)
def read_gasto_fijo(gasto_fijo_id: int, db: Session = Depends(get_db),
                    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Obtiene un gasto fijo por ID (solo si pertenece al usuario)."""
    db_gasto_fijo = crud_gasto_fijo.get_gasto_fijo(db, gasto_fijo_id=gasto_fijo_id)
    if db_gasto_fijo is None or db_gasto_fijo.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto no encontrado o no pertenece al usuario")
    return db_gasto_fijo

# PATCH /gastos/{gasto_fijo_id}
@router.patch("/{gasto_fijo_id}", response_model=gasto_fijo_schemas.GastoFijo)
def update_gasto_fijo(gasto_fijo_id: int, gasto_fijo_in: gasto_fijo_schemas.GastoFijoUpdate, db: Session = Depends(get_db),
                      current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Actualiza un gasto fijo existente (solo si pertenece al usuario)."""
    db_gasto_fijo = crud_gasto_fijo.get_gasto_fijo(db, gasto_fijo_id=gasto_fijo_id)
    if db_gasto_fijo is None or db_gasto_fijo.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto no encontrado o no pertenece al usuario")
        
    return crud_gasto_fijo.update_gasto_fijo(db, db_gasto_fijo=db_gasto_fijo, gasto_fijo_in=gasto_fijo_in)

# DELETE /gastos/{gasto_fijo_id}
@router.delete("/{gasto_fijo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gasto_fijo(gasto_fijo_id: int, db: Session = Depends(get_db),
                      current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Elimina un gasto fijo por ID (solo si pertenece al usuario)."""
    db_gasto_fijo = crud_gasto_fijo.get_gasto_fijo(db, gasto_fijo_id=gasto_fijo_id)
    if db_gasto_fijo is None or db_gasto_fijo.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto no encontrado o no pertenece al usuario")
        
    crud_gasto_fijo.delete_gasto_fijo(db, gasto_fijo_id=gasto_fijo_id)
    return