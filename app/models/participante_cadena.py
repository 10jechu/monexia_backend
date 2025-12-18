from sqlalchemy import Column, Integer, ForeignKey, Boolean, Float, String
from sqlalchemy.orm import relationship
from ..database import Base

class ParticipanteCadena(Base):
    __tablename__ = "participante_cadena"
    __table_args__ = {'schema': 'public'}

    usuario_id = Column(Integer, ForeignKey("public.usuario.id"), primary_key=True)
    cadena_id = Column(Integer, ForeignKey("public.cadenas_ahorro.id"), primary_key=True)
    es_organizador = Column(Boolean, default=False)
    
    # CAMPOS DE LÓGICA DE AHORRO
    meta_ahorro = Column(Float, default=0.0)      # Objetivo: 5.000.000
    saldo_actual = Column(Float, default=0.0)     # Lo que lleva acumulado
    fecha_cobro = Column(String, nullable=True)   # "2026-04-25"
    cuota_pactada = Column(Float, default=0.0)    # Ej: 250.000 quincenales

    usuario = relationship("Usuario", back_populates="cadenas_participante")
    cadena = relationship("CadenaAhorro", back_populates="participantes")