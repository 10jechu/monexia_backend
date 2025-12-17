# app/models/participante_cadena.py
from sqlalchemy import Column, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class ParticipanteCadena(Base):
    __tablename__ = "participante_cadena"
    __table_args__ = {'schema': 'public'}

    usuario_id = Column(Integer, ForeignKey("public.usuario.id"), primary_key=True)
    cadena_id = Column(Integer, ForeignKey("public.cadenas_ahorro.id"), primary_key=True)
    es_organizador = Column(Boolean, default=False)

    usuario = relationship("Usuario", back_populates="cadenas_participante")
    cadena = relationship("CadenaAhorro", back_populates="participantes")