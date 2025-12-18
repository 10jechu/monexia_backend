# app/crud/crud_deuda.py
from sqlalchemy.orm import Session
from ..models.deuda import Deuda
from ..schemas.deuda import DeudaCreate, DeudaUpdate

# ------------------------------------------------
# READ
# ------------------------------------------------

def get_deuda(db: Session, deuda_id: int):
    """Obtiene una deuda por su ID."""
    return db.query(Deuda).filter(Deuda.id == deuda_id).first()

def get_deudas_by_usuario(db: Session, usuario_id: int, skip: int = 0, limit: int = 100):
    """Obtiene las deudas de un usuario específico."""
    return db.query(Deuda).filter(Deuda.propietario_id == usuario_id).offset(skip).limit(limit).all()

# ------------------------------------------------
# CREATE
# ------------------------------------------------

def create_deuda(db: Session, deuda: DeudaCreate, usuario_id: int):
    """Crea una nueva deuda vinculada al usuario."""
    # Convertimos el esquema a diccionario para pasarlo al modelo
    db_deuda = Deuda(
        **deuda.model_dump(), 
        propietario_id=usuario_id
    )
    db.add(db_deuda)
    db.commit()
    db.refresh(db_deuda)
    return db_deuda

# ------------------------------------------------
# UPDATE (Corregido para el Router)
# ------------------------------------------------

def update_deuda(db: Session, db_obj: Deuda, obj_in: DeudaUpdate):
    """Actualiza la información de una deuda existente."""
    # Extraemos solo los datos que el usuario envió (exclude_unset)
    update_data = obj_in.model_dump(exclude_unset=True)
    
    for field in update_data:
        if hasattr(db_obj, field):
            setattr(db_obj, field, update_data[field])
            
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# ------------------------------------------------
# DELETE
# ------------------------------------------------

def delete_deuda(db: Session, deuda_id: int):
    """Elimina una deuda por su ID."""
    db_deuda = get_deuda(db, deuda_id)
    if db_deuda:
        db.delete(db_deuda)
        db.commit()
        return True
    return False