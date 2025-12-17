# app/main.py (CÓDIGO FINAL Y COMPLETO CON TODOS LOS ROUTERS)

from fastapi import FastAPI
from .database import Base, engine 

# -----------------------------------------------------------------
# 1. Importa TODOS los modelos (para crear las tablas)
# -----------------------------------------------------------------
from .models import usuario, ingreso, gasto_fijo, deuda, meta_ahorro, movimiento, pagos_deuda
from .models import cadena, participante_cadena 


# -----------------------------------------------------------------
# 2. Importa TODOS los routers y RENOMBRA
# -----------------------------------------------------------------
from .routers import usuario as usuario_router
from .routers import auth as auth_router     
from .routers import ingreso as ingreso_router
from .routers import gasto_fijo as gasto_fijo_router
from .routers import deuda as deuda_router
from .routers import pagos_deuda as pagos_deuda_router
from .routers import meta_ahorro as meta_ahorro_router
from .routers import movimiento as movimiento_router
from .routers import cadena as cadena_router 
from .routers import dashboard as dashboard_router


# -----------------------------------------------------------------
# 3. Crear las tablas
# -----------------------------------------------------------------
Base.metadata.create_all(bind=engine)

# 4. Inicializar FastAPI
app = FastAPI(
    title="API de Finanzas Monexia",
    description="Backend para la gestión de finanzas personales y familiares. ¡CRUD Completo!",
    version="1.0.0"
)

# -----------------------------------------------------------------
# 5. Incluye TODOS los routers
# -----------------------------------------------------------------
app.include_router(auth_router.router)          
app.include_router(usuario_router.router)       
app.include_router(ingreso_router.router)       
app.include_router(gasto_fijo_router.router)    
app.include_router(deuda_router.router)         
app.include_router(pagos_deuda_router.router)   
app.include_router(meta_ahorro_router.router)   
app.include_router(movimiento_router.router)    
app.include_router(cadena_router.router)        
app.include_router(dashboard_router.router)
# Endpoint raíz
@app.get("/")
def read_root():
    return {"message": "Backend de Finanzas Monexia Activo. Visita /docs para ver la API."}