# app/crud/crud_meta_ahorro.py
from sqlalchemy.orm import Session
from ..models.meta_ahorro import MetaAhorro
from ..schemas.meta_ahorro import MetaAhorroCreate, MetaAhorroUpdate
from datetime import datetime

# ------------------------------------------------
# READ
# ------------------------------------------------

def get_meta_ahorro(db: Session, meta_ahorro_id: int):
    """Obtiene una meta de ahorro por su ID."""
    return db.query(MetaAhorro).filter(MetaAhorro.id == meta_ahorro_id).first()

def get_metas_by_usuario(db: Session, usuario_id: int, skip: int = 0, limit: int = 100):
    """Obtiene las metas de ahorro de un usuario específico."""
    return db.query(MetaAhorro).filter(MetaAhorro.propietario_id == usuario_id).offset(skip).limit(limit).all()

# ------------------------------------------------
# CREATE
# ------------------------------------------------

def create_meta_ahorro(db: Session, meta_ahorro: MetaAhorroCreate, usuario_id: int):
    """Crea una nueva meta de ahorro asociada a un usuario."""
    # El monto_actual inicia en 0 por defecto en el modelo, pero se puede sobrescribir si se incluye en el schema
    db_meta = MetaAhorro(**meta_ahorro.model_dump(), propietario_id=usuario_id)
    db.add(db_meta)
    db.commit()
    db.refresh(db_meta)
    return db_meta

# ------------------------------------------------
# UPDATE
# ------------------------------------------------

def update_meta_ahorro(db: Session, db_meta: MetaAhorro, meta_ahorro_in: MetaAhorroUpdate):
    """Actualiza la información de una meta de ahorro existente."""
    update_data = meta_ahorro_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(db_meta, key):
            setattr(db_meta, key, value)
            
    db.commit()
    db.refresh(db_meta)
    return db_meta

# ------------------------------------------------
# DELETE
# ------------------------------------------------

def delete_meta_ahorro(db: Session, meta_ahorro_id: int):
    """Elimina una meta de ahorro por su ID."""
    db_meta = get_meta_ahorro(db, meta_ahorro_id)
    
    if db_meta:
        db.delete(db_meta)
        db.commit()
        return True
        
    return False

# ------------------------------------------------
# ACCIÓN: AÑADIR AHORRO
# ------------------------------------------------

def add_ahorro_to_meta(db: Session, meta_ahorro_id: int, monto_a_agregar: float):
    """Añade una cantidad al monto actual de una meta de ahorro."""
    db_meta = get_meta_ahorro(db, meta_ahorro_id)
    
    if db_meta:
        db_meta.monto_actual += monto_a_agregar
        db.commit()
        db.refresh(db_meta)
        return db_meta
        
    return None