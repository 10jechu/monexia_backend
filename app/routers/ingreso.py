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

@router.post("/", response_model=ingreso_schemas.Ingreso)
def create_ingreso_for_user(
    ingreso: ingreso_schemas.IngresoCreate,
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    return crud_ingreso.create_ingreso(db=db, ingreso=ingreso, usuario_id=current_user.id)

@router.get("/", response_model=List[ingreso_schemas.Ingreso])
def read_ingresos(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    return crud_ingreso.get_ingresos_by_usuario(db, usuario_id=current_user.id, skip=skip, limit=limit)

# CAMBIO AQUÍ: Usamos PUT para coincidir con el frontend
@router.put("/{ingreso_id}", response_model=ingreso_schemas.Ingreso)
def update_ingreso(
    ingreso_id: int, 
    ingreso_in: ingreso_schemas.IngresoUpdate, 
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    db_ingreso = crud_ingreso.get_ingreso(db, ingreso_id=ingreso_id)
    if db_ingreso is None or db_ingreso.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")
        
    return crud_ingreso.update_ingreso(db, db_ingreso=db_ingreso, ingreso_in=ingreso_in)

@router.delete("/{ingreso_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingreso(
    ingreso_id: int, 
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    db_ingreso = crud_ingreso.get_ingreso(db, ingreso_id=ingreso_id)
    if db_ingreso is None or db_ingreso.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")
        
    crud_ingreso.delete_ingreso(db, ingreso_id=ingreso_id)
    return