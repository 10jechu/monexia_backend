# app/crud/crud_cadena.py
from sqlalchemy.orm import Session
from ..models.cadena import CadenaAhorro # Usamos 'cadena' si el archivo es cadena.py
from ..schemas.cadena import CadenaAhorroCreate, CadenaAhorroUpdate

# ------------------------------------------------
# READ
# ------------------------------------------------

def get_cadena(db: Session, cadena_id: int):
    """Obtiene una cadena de ahorro por su ID."""
    return db.query(CadenaAhorro).filter(CadenaAhorro.id == cadena_id).first()

def get_cadenas(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene una lista de todas las cadenas de ahorro."""
    return db.query(CadenaAhorro).offset(skip).limit(limit).all()

# ------------------------------------------------
# CREATE
# ------------------------------------------------

def create_cadena(db: Session, cadena: CadenaAhorroCreate):
    """Crea una nueva cadena de ahorro."""
    db_cadena = CadenaAhorro(**cadena.model_dump())
    db.add(db_cadena)
    db.commit()
    db.refresh(db_cadena)
    return db_cadena

# ------------------------------------------------
# UPDATE
# ------------------------------------------------

def update_cadena(db: Session, db_cadena: CadenaAhorro, cadena_in: CadenaAhorroUpdate):
    """Actualiza la información de una cadena de ahorro existente."""
    update_data = cadena_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(db_cadena, key):
            setattr(db_cadena, key, value)
            
    db.commit()
    db.refresh(db_cadena)
    return db_cadena

# ------------------------------------------------
# DELETE
# ------------------------------------------------

def delete_cadena(db: Session, cadena_id: int):
    """Elimina una cadena de ahorro por su ID."""
    db_cadena = get_cadena(db, cadena_id)
    
    if db_cadena:
        db.delete(db_cadena)
        db.commit()
        return True
        
    return False