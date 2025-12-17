from fastapi import FastAPI
from .database import Base, engine 
from .models import usuario, ingreso, gasto_fijo, deuda, meta_ahorro, movimiento, pagos_deuda, cadena, participante_cadena 
from .routers import usuario as usuario_router, auth as auth_router, ingreso as ingreso_router, \
                     gasto_fijo as gasto_fijo_router, deuda as deuda_router, pagos_deuda as pagos_deuda_router, \
                     meta_ahorro as meta_ahorro_router, movimiento as movimiento_router, \
                     cadena as cadena_router, dashboard as dashboard_router
from fastapi.middleware.cors import CORSMiddleware

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Finanzas Monexia", version="1.0.0")

# --- CORRECCIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Routers
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

@app.get("/")
def read_root():
    return {"status": "online", "message": "Backend Monexia Activo"}