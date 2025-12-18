from sqlalchemy.orm import Session
from ..models.cadena import CadenaAhorro
from ..schemas import cadena as cadena_schemas

def get_cadena(db: Session, cadena_id: int):
    return db.query(CadenaAhorro).filter(CadenaAhorro.id == cadena_id).first()

def get_cadenas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CadenaAhorro).offset(skip).limit(limit).all()

def create_cadena(db: Session, cadena: cadena_schemas.CadenaAhorroCreate):
    # Usamos model_dump() para Pydantic V2
    db_cadena = CadenaAhorro(**cadena.model_dump())
    db.add(db_cadena)
    db.commit()
    db.refresh(db_cadena)
    return db_cadena

def update_cadena(db: Session, db_cadena: CadenaAhorro, cadena_in: cadena_schemas.CadenaAhorroUpdate):
    update_data = cadena_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cadena, key, value)
    db.commit()
    db.refresh(db_cadena)
    return db_cadena

def delete_cadena(db: Session, cadena_id: int):
    db_cadena = get_cadena(db, cadena_id)
    if db_cadena:
        db.delete(db_cadena)
        db.commit()
        return True
    return False