# app/routers/cadena.py (CRUD COMPLETO)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import cadena as cadena_schemas, usuario as usuario_schemas, participante_cadena as pc_schemas
from ..crud import crud_cadena, crud_participante_cadena
from ..utils.auth import get_current_active_user

router = APIRouter(
    prefix="/cadenas",
    tags=["Cadenas de Ahorro"],
)

# --- Operaciones de Cadena (CREATE, READ, UPDATE, DELETE) ---

# POST /cadenas/
@router.post("/", response_model=cadena_schemas.CadenaAhorro)
def create_cadena_ahorro(
    cadena: cadena_schemas.CadenaAhorroCreate, db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Crea una nueva cadena de ahorro y registra al usuario como el organizador."""
    db_cadena = crud_cadena.create_cadena(db=db, cadena=cadena)
    participante_data = pc_schemas.ParticipanteCadenaCreate(
        usuario_id=current_user.id, cadena_id=db_cadena.id, es_organizador=True
    )
    crud_participante_cadena.add_participante_to_cadena(db=db, participante=participante_data)
    return db_cadena

# GET /cadenas/{cadena_id}
@router.get("/{cadena_id}", response_model=cadena_schemas.CadenaAhorro)
def read_cadena_ahorro(cadena_id: int, db: Session = Depends(get_db),
                       current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Obtiene una cadena por ID (solo si el usuario es participante)."""
    db_cadena = crud_cadena.get_cadena(db, cadena_id)
    if not db_cadena:
        raise HTTPException(status_code=404, detail="Cadena no encontrada")
        
    # Validar que el usuario sea participante
    is_participant = crud_participante_cadena.get_participante(db, current_user.id, cadena_id)
    if not is_participant:
        raise HTTPException(status_code=403, detail="No eres participante de esta cadena")
        
    return db_cadena

# PATCH /cadenas/{cadena_id}
@router.patch("/{cadena_id}", response_model=cadena_schemas.CadenaAhorro)
def update_cadena_ahorro(cadena_id: int, cadena_in: cadena_schemas.CadenaAhorroUpdate, db: Session = Depends(get_db),
                         current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Actualiza una cadena (solo por el organizador)."""
    db_cadena = crud_cadena.get_cadena(db, cadena_id)
    if not db_cadena:
        raise HTTPException(status_code=404, detail="Cadena no encontrada")
        
    # Validar que el usuario sea el organizador
    participant = crud_participante_cadena.get_participante(db, current_user.id, cadena_id)
    if not participant or not participant.es_organizador:
        raise HTTPException(status_code=403, detail="Solo el organizador puede modificar la cadena")
        
    return crud_cadena.update_cadena(db, db_cadena=db_cadena, cadena_in=cadena_in)

# DELETE /cadenas/{cadena_id}
@router.delete("/{cadena_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cadena_ahorro(cadena_id: int, db: Session = Depends(get_db),
                         current_user: usuario_schemas.Usuario = Depends(get_current_active_user)):
    """Elimina una cadena (solo por el organizador)."""
    db_cadena = crud_cadena.get_cadena(db, cadena_id)
    if not db_cadena:
        raise HTTPException(status_code=404, detail="Cadena no encontrada")
        
    # Validar que el usuario sea el organizador
    participant = crud_participante_cadena.get_participante(db, current_user.id, cadena_id)
    if not participant or not participant.es_organizador:
        raise HTTPException(status_code=403, detail="Solo el organizador puede eliminar la cadena")
        
    crud_cadena.delete_cadena(db, cadena_id=cadena_id)
    return

# --- Operaciones de Participantes ---

# POST /cadenas/{cadena_id}/unirse (Ya estaba, solo para referencia)
@router.post("/{cadena_id}/unirse", response_model=pc_schemas.ParticipanteCadena)
def join_cadena_ahorro(
    cadena_id: int, db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Une al usuario autenticado a una cadena de ahorro existente."""
    db_cadena = crud_cadena.get_cadena(db, cadena_id)
    if not db_cadena:
        raise HTTPException(status_code=404, detail="Cadena de ahorro no encontrada")
        
    if crud_participante_cadena.get_participante(db, current_user.id, cadena_id):
        raise HTTPException(status_code=400, detail="El usuario ya es participante de esta cadena")

    participante_data = pc_schemas.ParticipanteCadenaCreate(
        usuario_id=current_user.id, cadena_id=cadena_id, es_organizador=False
    )
    return crud_participante_cadena.add_participante_to_cadena(db=db, participante=participante_data)

# DELETE /cadenas/{cadena_id}/salir
@router.delete("/{cadena_id}/salir", status_code=status.HTTP_204_NO_CONTENT)
def leave_cadena_ahorro(
    cadena_id: int, db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    """Permite al usuario salir de una cadena de ahorro."""
    participant = crud_participante_cadena.get_participante(db, current_user.id, cadena_id)

    if not participant:
        raise HTTPException(status_code=404, detail="No eres participante de esta cadena")
        
    if participant.es_organizador:
         raise HTTPException(status_code=400, detail="El organizador no puede salir sin transferir el rol o eliminar la cadena.")

    crud_participante_cadena.remove_participante_from_cadena(db, current_user.id, cadena_id)
    return