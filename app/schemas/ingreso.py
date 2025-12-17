# app/schemas/ingreso.py
from pydantic import BaseModel
from datetime import datetime

class IngresoBase(BaseModel):
    monto: float
    descripcion: str | None = None
    fecha: datetime | None = None

class IngresoCreate(IngresoBase):
    pass

class IngresoUpdate(IngresoBase):
    monto: float | None = None
    descripcion: str | None = None
    fecha: datetime | None = None

class Ingreso(IngresoBase):
    id: int
    propietario_id: int
    
    class Config:
        from_attributes = True