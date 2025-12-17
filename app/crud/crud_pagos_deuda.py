# app/crud/crud_pagos_deuda.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.pagos_deuda import PagoDeuda
from ..models.deuda import Deuda # Necesario para actualizar el monto pendiente
from ..schemas.pagos_deuda import PagoDeudaCreate, PagoDeudaUpdate

# ------------------------------------------------
# READ
# ------------------------------------------------

def get_pago_deuda(db: Session, pago_deuda_id: int):
    """Obtiene un pago de deuda por su ID."""
    return db.query(PagoDeuda).filter(PagoDeuda.id == pago_deuda_id).first()

def get_pagos_by_deuda(db: Session, deuda_id: int, skip: int = 0, limit: int = 100):
    """Obtiene los pagos de una deuda específica."""
    return db.query(PagoDeuda).filter(PagoDeuda.deuda_id == deuda_id).offset(skip).limit(limit).all()

# ------------------------------------------------
# CREATE
# ------------------------------------------------

def create_pago_deuda(db: Session, pago: PagoDeudaCreate):
    """Crea un nuevo pago de deuda y actualiza el monto pendiente de la deuda principal."""
    db_deuda = db.query(Deuda).filter(Deuda.id == pago.deuda_id).first()

    if not db_deuda:
        raise HTTPException(status_code=404, detail="Deuda principal no encontrada.")

    if db_deuda.monto_pendiente < pago.monto_pago:
        raise HTTPException(status_code=400, detail="El monto del pago excede el monto pendiente de la deuda.")

    # 1. Crear el pago
    db_pago = PagoDeuda(**pago.model_dump())
    db.add(db_pago)
    
    # 2. Actualizar el monto pendiente de la deuda principal
    db_deuda.monto_pendiente -= pago.monto_pago
    
    db.commit()
    db.refresh(db_pago)
    db.refresh(db_deuda)
    return db_pago

# ------------------------------------------------
# UPDATE (Solo permite actualizar el monto, pero es complejo y rara vez se necesita)
# ------------------------------------------------

def update_pago_deuda(db: Session, db_pago: PagoDeuda, pago_in: PagoDeudaUpdate):
    """Actualiza la información de un pago de deuda existente (solo campos simples)."""
    # NO recomendamos cambiar el monto_pago directamente sin recalcular la deuda principal,
    # pero aquí permitimos la actualización de otros campos (si existieran en el schema)
    
    update_data = pago_in.model_dump(exclude_unset=True)
    
    # Si se intenta cambiar el monto_pago, requeriría lógica compleja para revertir/reaplicar a la deuda
    if "monto_pago" in update_data:
        raise HTTPException(status_code=400, detail="La actualización del monto de pago requiere un proceso de reversión/reaplicación manual por la complejidad en la deuda principal.")
    
    for key, value in update_data.items():
        if hasattr(db_pago, key):
            setattr(db_pago, key, value)
            
    db.commit()
    db.refresh(db_pago)
    return db_pago

# ------------------------------------------------
# DELETE
# ------------------------------------------------

def delete_pago_deuda(db: Session, pago_deuda_id: int):
    """Elimina un pago de deuda y revierte el monto a la deuda principal."""
    db_pago = get_pago_deuda(db, pago_deuda_id)
    
    if db_pago:
        # 1. Revertir el monto a la deuda principal
        db_deuda = db.query(Deuda).filter(Deuda.id == db_pago.deuda_id).first()
        if db_deuda:
            db_deuda.monto_pendiente += db_pago.monto_pago
            db.add(db_deuda)
            
        # 2. Eliminar el pago
        db.delete(db_pago)
        db.commit()
        return True
        
    return False