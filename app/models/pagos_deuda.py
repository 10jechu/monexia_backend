# app/models/pagos_deuda.py
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class PagoDeuda(Base):
    __tablename__ = "pagos_deuda" 
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    monto_pago = Column(Float, nullable=False)
    fecha_pago = Column(DateTime, default=datetime.utcnow)
    
    deuda_id = Column(Integer, ForeignKey("public.deudas.id"), nullable=False)
    deuda = relationship("Deuda", back_populates="pagos")