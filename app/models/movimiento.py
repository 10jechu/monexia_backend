# app/models/movimiento.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Movimiento(Base):
    __tablename__ = "movimientos"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(50), nullable=False)
    monto = Column(Float, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    
    propietario_id = Column(Integer, ForeignKey("public.usuario.id"), nullable=False)
    propietario = relationship("Usuario", back_populates="movimientos")