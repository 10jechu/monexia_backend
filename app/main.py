from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine 
from .routers import (
    usuario, auth, ingreso, gasto_fijo, 
    deuda, pagos_deuda, meta_ahorro, 
    movimiento, cadena, dashboard
)

# Creación de tablas en la BD
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Monexia API", 
    description="Sistema de Gestión Financiera Cyberpunk",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambia esto a tu dominio real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador global de errores para evitar que el server caiga sin avisar
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Error interno en el servidor: {str(exc)}"}
    )

# Inclusión de Rutas
app.include_router(auth.router)
app.include_router(usuario.router)
app.include_router(ingreso.router)
app.include_router(gasto_fijo.router)
app.include_router(deuda.router)
app.include_router(meta_ahorro.router)
app.include_router(pagos_deuda.router)
app.include_router(movimiento.router)
app.include_router(cadena.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {
        "app": "Monexia Backend",
        "status": "online",
        "docs": "/docs"
    }