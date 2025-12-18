from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, TYPE_CHECKING

# Si necesitamos tipado para autocompletado pero sin importar en tiempo de ejecución
if TYPE_CHECKING:
    from .usuario import Usuario

class ParticipanteCadenaBase(BaseModel):
    usuario_id: int
    cadena_id: int
    es_organizador: bool = False
    meta_ahorro: float = 0.0
    saldo_actual: float = 0.0
    fecha_cobro: Optional[str] = None
    cuota_pactada: float = 0.0

class ParticipanteCadenaCreate(ParticipanteCadenaBase):
    pass

class ParticipanteCadenaUpdate(BaseModel):
    meta_ahorro: float
    fecha_cobro: str
    cuota_pactada: float

class RegistroPago(BaseModel):
    monto: float

class ParticipanteCadena(ParticipanteCadenaBase):
    # Usamos string para evitar el bucle infinito
    usuario: Optional["Usuario"] = None 

    class Config:
        from_attributes = True

# Forzamos la reconstrucción para que reconozca "Usuario" cuando esté listo
try:
    from .usuario import Usuario
    ParticipanteCadena.model_rebuild()
except ImportError:
    pass