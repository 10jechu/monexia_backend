# app/schemas/deuda.py
from pydantic import BaseModel
from datetime import datetime
from typing import List

# Importamos PagoDeuda para evitar una referencia circular
from .pagos_deuda import PagoDeuda # Importación relativa

class DeudaBase(BaseModel):
    nombre: str
    monto_total: float
    fecha_inicio: datetime | None = None
    fecha_limite: datetime | None = None

class DeudaCreate(DeudaBase):
    pass

class DeudaUpdate(DeudaBase):
    nombre: str | None = None
    monto_total: float | None = None
    fecha_limite: datetime | None = None

class Deuda(DeudaBase):
    id: int
    monto_pendiente: float
    propietario_id: int
    # Relación: Incluir lista de pagos
    pagos: List[PagoDeuda] = [] 
    
    class Config:
        from_attributes = True