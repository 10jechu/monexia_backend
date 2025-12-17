# app/models/usuario.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class Usuario(Base):
    __tablename__ = "usuario"
    __table_args__ = {'schema': 'public'} 

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    rol = Column(String, default="Miembro")
    activo = Column(Boolean, default=True)

    # Definición de relaciones (back_populates deben coincidir con los otros modelos)
    ingresos = relationship("Ingreso", back_populates="propietario")
    gastos = relationship("GastoFijo", back_populates="propietario")
    deudas = relationship("Deuda", back_populates="propietario")
    metas = relationship("MetaAhorro", back_populates="propietario")
    movimientos = relationship("Movimiento", back_populates="propietario")
    cadenas_participante = relationship("ParticipanteCadena", back_populates="usuario")