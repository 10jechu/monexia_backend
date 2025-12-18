from __future__ import annotations
from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: str = "Miembro"

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(UsuarioBase):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    rol: Optional[str] = None
    activo: Optional[bool] = None

class Usuario(UsuarioBase):
    id: int
    activo: bool
    
    # Referencias cruzadas
    ingresos: List["Ingreso"] = []
    gastos: List["GastoFijo"] = []
    deudas: List["Deuda"] = []
    metas: List["MetaAhorro"] = []
    movimientos: List["Movimiento"] = []
    cadenas_participante: List["ParticipanteCadena"] = []

    class Config:
        from_attributes = True

# Reconstrucción de modelos para Pydantic V2
try:
    from .ingreso import Ingreso
    from .gasto_fijo import GastoFijo
    from .deuda import Deuda
    from .meta_ahorro import MetaAhorro
    from .movimiento import Movimiento
    from .participante_cadena import ParticipanteCadena
    
    Usuario.model_rebuild() 
except ImportError:
    pass