# app/models/deuda.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Deuda(Base):
    __tablename__ = "deudas"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    monto_total = Column(Float, nullable=False)
    monto_pendiente = Column(Float, nullable=False)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_limite = Column(DateTime)
    
    propietario_id = Column(Integer, ForeignKey("public.usuario.id"), nullable=False)
    propietario = relationship("Usuario", back_populates="deudas")
    
    # Relación con pagos_deuda
    pagos = relationship("PagoDeuda", back_populates="deuda")