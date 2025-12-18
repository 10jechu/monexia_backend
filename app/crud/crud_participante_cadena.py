from sqlalchemy.orm import Session
from ..models.participante_cadena import ParticipanteCadena
from ..schemas.participante_cadena import ParticipanteCadenaCreate, ParticipanteCadenaUpdate

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
    return db.query(ParticipanteCadena).filter(
        ParticipanteCadena.cadena_id == cadena_id
    ).offset(skip).limit(limit).all()

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
# UPDATE (Nuevo: Necesario para marcar pagos y turnos)
# ------------------------------------------------

def update_participante_status(db: Session, db_obj: ParticipanteCadena, obj_in: ParticipanteCadenaUpdate):
    """Actualiza si el participante ya pagó su cuota o recibió el total."""
    update_data = obj_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

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