# app/schemas/meta_ahorro.py
from pydantic import BaseModel
from datetime import datetime

class MetaAhorroBase(BaseModel):
    nombre: str
    monto_objetivo: float
    fecha_limite: datetime | None = None

class MetaAhorroCreate(MetaAhorroBase):
    monto_actual: float = 0.0

class MetaAhorroUpdate(MetaAhorroBase):
    nombre: str | None = None
    monto_objetivo: float | None = None
    fecha_limite: datetime | None = None

class MetaAhorro(MetaAhorroBase):
    id: int
    monto_actual: float
    fecha_creacion: datetime
    propietario_id: int
    
    class Config:
        from_attributes = True