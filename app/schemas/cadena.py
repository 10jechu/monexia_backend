# app/schemas/cadena.py
from pydantic import BaseModel
from typing import List

# Importamos ParticipanteCadena
from .participante_cadena import ParticipanteCadena # Importación relativa

class CadenaAhorroBase(BaseModel):
    nombre: str
    monto_fijo: float

class CadenaAhorroCreate(CadenaAhorroBase):
    pass

class CadenaAhorroUpdate(CadenaAhorroBase):
    nombre: str | None = None
    monto_fijo: float | None = None

class CadenaAhorro(CadenaAhorroBase):
    id: int
    # Relación: Incluir lista de participantes
    participantes: List[ParticipanteCadena] = [] 
    
    class Config:
        from_attributes = True