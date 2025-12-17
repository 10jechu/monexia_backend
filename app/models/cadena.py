# app/models/cadena.py
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from ..database import Base

class CadenaAhorro(Base):
    __tablename__ = "cadenas_ahorro"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    monto_fijo = Column(Float, nullable=False)
    
    # Relación Inversa con la tabla de unión
    participantes = relationship("ParticipanteCadena", back_populates="cadena")