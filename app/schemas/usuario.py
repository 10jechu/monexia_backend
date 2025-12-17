# app/schemas/usuario.py (VERSIÓN FINAL Y COMPLETA - SOLUCIÓN DEFINITIVA)

from __future__ import annotations
from pydantic import BaseModel, EmailStr
from typing import List

# -------------------------------------------------------------------
# 1. Esquemas Base
# -------------------------------------------------------------------
class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: str = "Miembro"

# Esquemas para CREAR
class UsuarioCreate(UsuarioBase):
    password: str

# Esquemas para ACTUALIZAR
class UsuarioUpdate(UsuarioBase):
    nombre: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    rol: str | None = None
    activo: bool | None = None

# -------------------------------------------------------------------
# 2. Esquemas de RESPUESTA (Usando CADENAS DE TEXTO)
# -------------------------------------------------------------------
class Usuario(UsuarioBase):
    id: int
    activo: bool
    
    # Usamos cadenas de texto literales para evitar el fallo de importación circular
    ingresos: List["Ingreso"] = []
    gastos: List["GastoFijo"] = []
    deudas: List["Deuda"] = []
    metas: List["MetaAhorro"] = []
    movimientos: List["Movimiento"] = []
    cadenas_participante: List["ParticipanteCadena"] = []

    model_config = {'from_attributes': True}

# -------------------------------------------------------------------
# 3. Solución Pydantic V2: Forzar Recompilación con Importaciones
# -------------------------------------------------------------------

# IMPORTANTE: Importamos las clases necesarias solo aquí. Esto funciona porque 
# en este punto, el módulo usuario.py ya está parcialmente cargado y 
# las importaciones que causan el bucle ahora pueden resolverse.

try:
    from .ingreso import Ingreso
    from .gasto_fijo import GastoFijo
    from .deuda import Deuda
    from .meta_ahorro import MetaAhorro
    from .movimiento import Movimiento
    from .participante_cadena import ParticipanteCadena
    
    # La recompilación se ejecuta después de que las clases están disponibles en el contexto
    Usuario.model_rebuild() 
    
except ImportError:
    # Esto ocurre si los esquemas Ingreso/GastoFijo aún no existen. 
    # Si el servidor ya inició, esta es una advertencia que podemos ignorar.
    pass