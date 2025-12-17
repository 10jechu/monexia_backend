# app/models/ingreso.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Ingreso(Base):
    __tablename__ = "ingresos"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    monto = Column(Float, nullable=False)
    descripcion = Column(String(255))
    fecha = Column(DateTime, default=datetime.utcnow)
    
    propietario_id = Column(Integer, ForeignKey("public.usuario.id"), nullable=False)
    propietario = relationship("Usuario", back_populates="ingresos")