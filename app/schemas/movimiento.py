# app/schemas/movimiento.py
from pydantic import BaseModel
from datetime import datetime

class MovimientoBase(BaseModel):
    tipo: str
    monto: float
    fecha: datetime | None = None

class MovimientoCreate(MovimientoBase):
    pass

class MovimientoUpdate(MovimientoBase):
    tipo: str | None = None
    monto: float | None = None
    fecha: datetime | None = None

class Movimiento(MovimientoBase):
    id: int
    propietario_id: int
    
    class Config:
        from_attributes = True