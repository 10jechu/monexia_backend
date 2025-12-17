# app/crud/crud_participante_cadena.py
from sqlalchemy.orm import Session
from ..models.participante_cadena import ParticipanteCadena
from ..schemas.participante_cadena import ParticipanteCadenaCreate

# ------------------------------------------------
# READ
# ------------------------------------------------

def get_participante(db: Session, usuario_id: int, cadena_id: int):
    """Obtiene una relación participante-cadena específica."""
    return db.query(ParticipanteCadena).filter(
        ParticipanteCadena.usuario_id == usuario_id,
        ParticipanteCadena.cadena_id == cadena_id
    ).first()

def get_participantes_by_cadena(db: Session, cadena_id: int, skip: int = 0, limit: int = 100):
    """Obtiene todos los participantes de una cadena específica."""
    return db.query(ParticipanteCadena).filter(ParticipanteCadena.cadena_id == cadena_id).offset(skip).limit(limit).all()

# ------------------------------------------------
# CREATE
# ------------------------------------------------

def add_participante_to_cadena(db: Session, participante: ParticipanteCadenaCreate):
    """Agrega un usuario como participante a una cadena."""
    db_participante = ParticipanteCadena(**participante.model_dump())
    db.add(db_participante)
    db.commit()
    db.refresh(db_participante)
    return db_participante

# ------------------------------------------------
# DELETE
# ------------------------------------------------

def remove_participante_from_cadena(db: Session, usuario_id: int, cadena_id: int):
    """Elimina la relación de participación."""
    db_participante = get_participante(db, usuario_id, cadena_id)
    
    if db_participante:
        db.delete(db_participante)
        db.commit()
        return True
        
    return False