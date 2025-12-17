# app/schemas/pagos_deuda.py
from pydantic import BaseModel
from datetime import datetime

class PagoDeudaBase(BaseModel):
    deuda_id: int
    monto_pago: float
    fecha_pago: datetime | None = None

class PagoDeudaCreate(PagoDeudaBase):
    pass

class PagoDeudaUpdate(BaseModel):
    pass 

class PagoDeuda(PagoDeudaBase):
    id: int
    
    class Config:
        from_attributes = True