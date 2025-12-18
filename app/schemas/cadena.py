from pydantic import BaseModel
from typing import List, Optional
from .participante_cadena import ParticipanteCadena

class CadenaAhorroBase(BaseModel):
    nombre: str
    monto_fijo: float = 0.0

class CadenaAhorroCreate(CadenaAhorroBase):
    pass

class CadenaAhorroUpdate(BaseModel):
    nombre: Optional[str] = None
    monto_fijo: Optional[float] = None

class CadenaAhorro(CadenaAhorroBase):
    id: int
    # Esto permite que al consultar la cadena veas a los participantes y sus metas
    participantes: List[ParticipanteCadena] = []

    class Config:
        from_attributes = True