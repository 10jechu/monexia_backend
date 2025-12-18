from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import cadena as cadena_schemas
from ..schemas import participante_cadena as pc_schemas
from ..schemas import usuario as usuario_schemas
from ..crud import crud_cadena, crud_participante_cadena
from ..utils.auth import get_current_active_user

router = APIRouter(prefix="/cadenas", tags=["Cadenas de Ahorro"])

# 1. CREAR CADENA
@router.post("/", response_model=cadena_schemas.CadenaAhorro)
def create_cadena_ahorro(
    cadena: cadena_schemas.CadenaAhorroCreate, 
    db: Session = Depends(get_db),
    current_user: usuario_schemas.Usuario = Depends(get_current_active_user)
):
    # Crear la estructura de la cadena
    db_cadena = crud_cadena.create_cadena(db=db, cadena=cadena)
    
    # Crear el organizador como primer participante
    participante_data = pc_schemas.ParticipanteCadenaCreate(
        usuario_id=current_user.id, 
        cadena_id=db_cadena.id, 
        es_organizador=True,
        saldo_actual=0.0
    )
    crud_participante_cadena.add_participante_to_cadena(db=db, participante=participante_data)
    return db_cadena

# 2. LEER CADENAS (Filtradas por usuario para privacidad)
@router.get("/", response_model=List[cadena_schemas.CadenaAhorro])
def read_cadenas(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    # Sugerencia: Deberías filtrar para que el usuario solo vea sus cadenas
    return crud_cadena.get_cadenas(db)

# 3. ACTUALIZAR META (Uso de CRUD estandarizado)
@router.patch("/{cadena_id}/meta", response_model=pc_schemas.ParticipanteCadena)
def update_meta_individual(
    cadena_id: int, 
    meta_in: pc_schemas.ParticipanteCadenaUpdate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_active_user)
):
    db_participante = crud_participante_cadena.get_participante(db, current_user.id, cadena_id)
    if not db_participante:
        raise HTTPException(status_code=404, detail="No eres miembro de esta cadena")

    # Usamos la función de update del CRUD que definimos antes para mantener consistencia
    return crud_participante_cadena.update_participante_status(
        db=db, 
        db_obj=db_participante, 
        obj_in=meta_in
    )

# 4. REGISTRAR ABONO (Suma de saldo)
@router.post("/{cadena_id}/abonar", response_model=pc_schemas.ParticipanteCadena)
def registrar_abono(
    cadena_id: int, 
    pago: pc_schemas.RegistroPago, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_active_user)
):
    db_participante = crud_participante_cadena.get_participante(db, current_user.id, cadena_id)
    if not db_participante:
        raise HTTPException(status_code=404, detail="No eres miembro de esta cadena")

    # Sumar al saldo actual
    db_participante.saldo_actual += pago.monto
    
    db.commit()
    db.refresh(db_participante)
    return db_participante