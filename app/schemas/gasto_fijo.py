# app/schemas/gasto_fijo.py
from pydantic import BaseModel

class GastoFijoBase(BaseModel):
    nombre: str
    monto: float
    recurrencia: str | None = None
    pagado: bool = False

class GastoFijoCreate(GastoFijoBase):
    pass

class GastoFijoUpdate(GastoFijoBase):
    nombre: str | None = None
    monto: float | None = None
    recurrencia: str | None = None
    pagado: bool | None = None

class GastoFijo(GastoFijoBase):
    id: int
    propietario_id: int
    
    class Config:
        from_attributes = True