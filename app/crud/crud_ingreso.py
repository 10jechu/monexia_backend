# app/crud/crud_ingreso.py
from sqlalchemy.orm import Session
from ..models.ingreso import Ingreso
from ..schemas.ingreso import IngresoCreate, IngresoUpdate

# ------------------------------------------------
# READ
# ------------------------------------------------

def get_ingreso(db: Session, ingreso_id: int):
    """Obtiene un ingreso por su ID."""
    return db.query(Ingreso).filter(Ingreso.id == ingreso_id).first()

def get_ingresos_by_usuario(db: Session, usuario_id: int, skip: int = 0, limit: int = 100):
    """Obtiene los ingresos de un usuario específico."""
    return db.query(Ingreso).filter(Ingreso.propietario_id == usuario_id).offset(skip).limit(limit).all()

# ------------------------------------------------
# CREATE
# ------------------------------------------------

def create_ingreso(db: Session, ingreso: IngresoCreate, usuario_id: int):
    """Crea un nuevo ingreso asociado a un usuario."""
    db_ingreso = Ingreso(**ingreso.model_dump(), propietario_id=usuario_id)
    db.add(db_ingreso)
    db.commit()
    db.refresh(db_ingreso)
    return db_ingreso

# ------------------------------------------------
# UPDATE
# ------------------------------------------------

def update_ingreso(db: Session, db_ingreso: Ingreso, ingreso_in: IngresoUpdate):
    """Actualiza la información de un ingreso existente."""
    update_data = ingreso_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(db_ingreso, key):
            setattr(db_ingreso, key, value)
            
    db.commit()
    db.refresh(db_ingreso)
    return db_ingreso

# ------------------------------------------------
# DELETE
# ------------------------------------------------

def delete_ingreso(db: Session, ingreso_id: int):
    """Elimina un ingreso por su ID."""
    db_ingreso = get_ingreso(db, ingreso_id)
    
    if db_ingreso:
        db.delete(db_ingreso)
        db.commit()
        return True
        
    return False