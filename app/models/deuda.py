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
    
    # NUEVO: Campos para el simulador matemático
    tasa_interes = Column(Float, default=0.0)  # Ej: 2.0 para el 2%
    tipo_tasa = Column(String(20), default="mensual") 
    
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_limite = Column(DateTime)
    
    propietario_id = Column(Integer, ForeignKey("public.usuario.id"), nullable=False)
    propietario = relationship("Usuario", back_populates="deudas")
    pagos = relationship("PagoDeuda", back_populates="deuda", cascade="all, delete-orphan")