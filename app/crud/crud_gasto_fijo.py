# app/crud/crud_gasto_fijo.py
from sqlalchemy.orm import Session
from ..models.gasto_fijo import GastoFijo
from ..schemas.gasto_fijo import GastoFijoCreate, GastoFijoUpdate

# ------------------------------------------------
# READ
# ------------------------------------------------

def get_gasto_fijo(db: Session, gasto_fijo_id: int):
    """Obtiene un gasto fijo por su ID."""
    return db.query(GastoFijo).filter(GastoFijo.id == gasto_fijo_id).first()

def get_gastos_fijos_by_usuario(db: Session, usuario_id: int, skip: int = 0, limit: int = 100):
    """Obtiene los gastos fijos de un usuario específico."""
    return db.query(GastoFijo).filter(GastoFijo.propietario_id == usuario_id).offset(skip).limit(limit).all()

# ------------------------------------------------
# CREATE
# ------------------------------------------------

def create_gasto_fijo(db: Session, gasto_fijo: GastoFijoCreate, usuario_id: int):
    """Crea un nuevo gasto fijo asociado a un usuario."""
    db_gasto_fijo = GastoFijo(**gasto_fijo.model_dump(), propietario_id=usuario_id)
    db.add(db_gasto_fijo)
    db.commit()
    db.refresh(db_gasto_fijo)
    return db_gasto_fijo

# ------------------------------------------------
# UPDATE
# ------------------------------------------------

def update_gasto_fijo(db: Session, db_gasto_fijo: GastoFijo, gasto_fijo_in: GastoFijoUpdate):
    """Actualiza la información de un gasto fijo existente."""
    update_data = gasto_fijo_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(db_gasto_fijo, key):
            setattr(db_gasto_fijo, key, value)
            
    db.commit()
    db.refresh(db_gasto_fijo)
    return db_gasto_fijo

# ------------------------------------------------
# DELETE
# ------------------------------------------------

def delete_gasto_fijo(db: Session, gasto_fijo_id: int):
    """Elimina un gasto fijo por su ID."""
    db_gasto_fijo = get_gasto_fijo(db, gasto_fijo_id)
    
    if db_gasto_fijo:
        db.delete(db_gasto_fijo)
        db.commit()
        return True
        
    return False