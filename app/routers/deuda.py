from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import deuda as deuda_schemas, usuario as usuario_schemas
from ..crud import crud_deuda
from ..utils.auth import get_current_active_user

router = APIRouter(
    prefix="/deudas",
    tags=["Deudas"],
)

@router.post("/", response_model=deuda_schemas.Deuda)
def create_deuda_for_user(
    deuda: deuda_schemas.DeudaCreate,
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Crea una deuda. El esquema ya incluye tasa_interes."""
    return crud_deuda.create_deuda(db=db, deuda=deuda, usuario_id=current_user.id)

@router.get("/", response_model=List[deuda_schemas.Deuda])
def read_deudas(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    return crud_deuda.get_deudas_by_usuario(db, usuario_id=current_user.id, skip=skip, limit=limit)

@router.get("/{deuda_id}", response_model=deuda_schemas.Deuda)
def read_deuda(deuda_id: int, db: Session = Depends(get_db),
               current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    db_deuda = crud_deuda.get_deuda(db, deuda_id=deuda_id)
    if db_deuda is None or db_deuda.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    return db_deuda

@router.patch("/{deuda_id}", response_model=deuda_schemas.Deuda)
def update_deuda(deuda_id: int, deuda_in: deuda_schemas.DeudaUpdate, db: Session = Depends(get_db),
                 current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    db_deuda = crud_deuda.get_deuda(db, deuda_id=deuda_id)
    if db_deuda is None or db_deuda.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    return crud_deuda.update_deuda(db, db_deuda=db_deuda, deuda_in=deuda_in)

@router.delete("/{deuda_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deuda(deuda_id: int, db: Session = Depends(get_db),
                 current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    db_deuda = crud_deuda.get_deuda(db, deuda_id=deuda_id)
    if db_deuda is None or db_deuda.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    crud_deuda.delete_deuda(db, deuda_id=deuda_id)
    return