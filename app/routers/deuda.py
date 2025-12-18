from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..schemas import deuda as deuda_schemas, usuario as usuario_schemas
from ..crud import crud_deuda
from ..models import movimiento as movimiento_models
from ..utils.auth import get_current_active_user

# ESTO ES LO QUE BUSCA EL MAIN.PY
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
    nueva_deuda = crud_deuda.create_deuda(db=db, deuda=deuda, usuario_id=current_user.id)
    
   # Crear movimiento automático (Corregido sin tilde)
    nuevo_movimiento = movimiento_models.Movimiento(
        descripcion=f"REGISTRO DEUDA: {deuda.nombre}", 
        monto=deuda.monto_total,
        tipo="deuda", 
        fecha=datetime.now(),
        usuario_id=current_user.id
    )
    
    db.add(nuevo_movimiento)
    db.commit()
    db.refresh(nueva_deuda)
    return nueva_deuda

@router.get("/", response_model=List[deuda_schemas.Deuda])
def read_deudas(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    return crud_deuda.get_deudas_by_usuario(db, usuario_id=current_user.id, skip=skip, limit=limit)

@router.patch("/{deuda_id}", response_model=deuda_schemas.Deuda)
def update_deuda(
    deuda_id: int, 
    deuda_update: deuda_schemas.DeudaUpdate, 
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    db_deuda = crud_deuda.get_deuda(db, deuda_id=deuda_id)
    if not db_deuda or db_deuda.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    # IMPORTANTE: Los nombres de argumentos deben coincidir con tu CRUD
    return crud_deuda.update_deuda(db=db, db_obj=db_deuda, obj_in=deuda_update)

@router.delete("/{deuda_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deuda(deuda_id: int, db: Session = Depends(get_db),
                 current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    db_deuda = crud_deuda.get_deuda(db, deuda_id=deuda_id)
    if db_deuda is None or db_deuda.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    crud_deuda.delete_deuda(db, deuda_id=deuda_id)
    return