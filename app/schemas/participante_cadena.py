# app/schemas/participante_cadena.py
from pydantic import BaseModel

# Forward reference para la clase Usuario (se resolverá después)
class UsuarioForPC(BaseModel):
    id: int
    nombre: str
    email: str
    
    class Config:
        from_attributes = True

class ParticipanteCadenaBase(BaseModel):
    usuario_id: int
    cadena_id: int
    es_organizador: bool = False

class ParticipanteCadenaCreate(ParticipanteCadenaBase):
    pass

class ParticipanteCadena(ParticipanteCadenaBase):
    # Opcionalmente, incluir los datos básicos del usuario
    usuario: UsuarioForPC | None = None 
    
    class Config:
        from_attributes = True

# Necesario para resolver la referencia circular si la usamos en otro lado
ParticipanteCadena.model_rebuild()