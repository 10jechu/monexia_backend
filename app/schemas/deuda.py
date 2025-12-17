from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from .pagos_deuda import PagoDeuda 

# Clase base con todos los campos necesarios para el simulador
class DeudaBase(BaseModel):
    nombre: str
    monto_total: float
    # Campos obligatorios para el cálculo matemático del simulador
    tasa_interes: Optional[float] = 0.0  # Porcentaje (ej: 2.0)
    tipo_tasa: Optional[str] = "mensual" # 'mensual' o 'anual'
    fecha_inicio: Optional[datetime] = None
    fecha_limite: Optional[datetime] = None

# Lo que se usa al crear una deuda (POST)
class DeudaCreate(DeudaBase):
    pass

# Lo que se usa para editar (PATCH) - Todo es opcional aquí
class DeudaUpdate(BaseModel):
    nombre: Optional[str] = None
    monto_total: Optional[float] = None
    monto_pendiente: Optional[float] = None
    tasa_interes: Optional[float] = None
    tipo_tasa: Optional[str] = None
    fecha_limite: Optional[datetime] = None

# Lo que el API devuelve al Frontend (GET)
class Deuda(DeudaBase):
    id: int
    monto_pendiente: float
    propietario_id: int
    # Incluimos la lista de pagos para mostrar el historial en el simulador
    pagos: List[PagoDeuda] = [] 
    
    class Config:
        from_attributes = True