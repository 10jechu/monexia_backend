# app/crud/crud_movimiento.py
from sqlalchemy.orm import Session
from ..models.movimiento import Movimiento
from ..schemas.movimiento import MovimientoCreate, MovimientoUpdate
from datetime import datetime

# ------------------------------------------------
# READ
# ------------------------------------------------

def get_movimiento(db: Session, movimiento_id: int):
    """Obtiene un movimiento por su ID."""
    return db.query(Movimiento).filter(Movimiento.id == movimiento_id).first()

def get_movimientos_by_usuario(db: Session, usuario_id: int, skip: int = 0, limit: int = 100):
    """Obtiene los movimientos de un usuario específico."""
    return db.query(Movimiento).filter(Movimiento.propietario_id == usuario_id).offset(skip).limit(limit).all()

# ------------------------------------------------
# CREATE
# ------------------------------------------------

def create_movimiento(db: Session, movimiento: MovimientoCreate, usuario_id: int):
    """Crea un nuevo movimiento asociado a un usuario."""
    db_movimiento = Movimiento(**movimiento.model_dump(), propietario_id=usuario_id)
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento

# ------------------------------------------------
# UPDATE
# ------------------------------------------------

def update_movimiento(db: Session, db_movimiento: Movimiento, movimiento_in: MovimientoUpdate):
    """Actualiza la información de un movimiento existente."""
    update_data = movimiento_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(db_movimiento, key):
            setattr(db_movimiento, key, value)
            
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento

# ------------------------------------------------
# DELETE
# ------------------------------------------------

def delete_movimiento(db: Session, movimiento_id: int):
    """Elimina un movimiento por su ID."""
    db_movimiento = get_movimiento(db, movimiento_id)
    
    if db_movimiento:
        db.delete(db_movimiento)
        db.commit()
        return True
        
    return False