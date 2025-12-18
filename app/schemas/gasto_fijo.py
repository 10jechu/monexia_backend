# app/schemas/gasto_fijo.py
from pydantic import BaseModel
from typing import Optional

class GastoFijoBase(BaseModel):
    nombre: str
    monto: float
    # AGREGA ESTA LÍNEA
    fecha_pago: Optional[str] = None 
    recurrencia: Optional[str] = None
    pagado: bool = False

class GastoFijoCreate(GastoFijoBase):
    pass

class GastoFijoUpdate(BaseModel): # Quitamos herencia para que todo sea opcional
    nombre: Optional[str] = None
    monto: Optional[float] = None
    fecha_pago: Optional[str] = None
    recurrencia: Optional[str] = None
    pagado: Optional[bool] = None

class GastoFijo(GastoFijoBase):
    id: int
    propietario_id: int
    
    class Config:
        from_attributes = True