# app/models/gasto_fijo.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class GastoFijo(Base): 
    __tablename__ = "gastos_fijos"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    monto = Column(Float, nullable=False)
    recurrencia = Column(String(50))
    pagado = Column(Boolean, default=False)
    
    propietario_id = Column(Integer, ForeignKey("public.usuario.id"), nullable=False)
    propietario = relationship("Usuario", back_populates="gastos")