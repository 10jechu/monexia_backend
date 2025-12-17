# app/routers/pagos_deuda.py (CRUD COMPLETO - GET, POST, DELETE)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import pagos_deuda as pagos_deuda_schemas, usuario as usuario_schemas
from ..crud import crud_pagos_deuda
from ..crud import crud_deuda # Necesario para la validación del propietario
from ..utils.auth import get_current_active_user

router = APIRouter(
    prefix="/pagos-deuda",
    tags=["Pagos de Deuda"],
)

# POST /pagos-deuda/
@router.post("/", response_model=pagos_deuda_schemas.PagoDeuda)
def create_pago_deuda(
    pago: pagos_deuda_schemas.PagoDeudaCreate,
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Registra un pago y actualiza el monto pendiente de la deuda."""
    # 1. Validar que la deuda exista y pertenezca al usuario
    db_deuda = crud_deuda.get_deuda(db, deuda_id=pago.deuda_id)
    if not db_deuda or db_deuda.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deuda no encontrada o no pertenece al usuario")

    # 2. Crear el pago y actualizar la deuda (lógica en CRUD)
    try:
        return crud_pagos_deuda.create_pago_deuda(db=db, pago=pago)
    except HTTPException as e:
        raise e

# GET /pagos-deuda/deuda/{deuda_id}
@router.get("/deuda/{deuda_id}", response_model=List[pagos_deuda_schemas.PagoDeuda])
def read_pagos_by_deuda(
    deuda_id: int, db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Obtiene todos los pagos realizados para una deuda específica."""
    db_deuda = crud_deuda.get_deuda(db, deuda_id=deuda_id)
    if not db_deuda or db_deuda.propietario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deuda no encontrada o no pertenece al usuario")
        
    return crud_pagos_deuda.get_pagos_by_deuda(db, deuda_id=deuda_id)

# GET /pagos-deuda/{pago_id}
@router.get("/{pago_id}", response_model=pagos_deuda_schemas.PagoDeuda)
def read_pago_deuda(pago_id: int, db: Session = Depends(get_db),
                    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Obtiene un pago específico por ID."""
    db_pago = crud_pagos_deuda.get_pago_deuda(db, pago_deuda_id=pago_id)
    
    if db_pago:
        # Validar que la deuda asociada al pago pertenezca al usuario
        db_deuda = crud_deuda.get_deuda(db, deuda_id=db_pago.deuda_id)
        if db_deuda.propietario_id != current_user.id:
             raise HTTPException(status_code=403, detail="El pago no pertenece a una deuda de este usuario.")
        return db_pago
    
    raise HTTPException(status_code=404, detail="Pago no encontrado.")

# DELETE /pagos-deuda/{pago_id}
@router.delete("/{pago_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pago_deuda(pago_id: int, db: Session = Depends(get_db),
                      current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Elimina un pago y revierte el monto a la deuda principal."""
    db_pago = crud_pagos_deuda.get_pago_deuda(db, pago_deuda_id=pago_id)
    
    if db_pago:
        db_deuda = crud_deuda.get_deuda(db, deuda_id=db_pago.deuda_id)
        if db_deuda.propietario_id != current_user.id:
             raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este pago.")
             
        crud_pagos_deuda.delete_pago_deuda(db, pago_deuda_id=pago_id)
        return
        
    raise HTTPException(status_code=404, detail="Pago no encontrado.")