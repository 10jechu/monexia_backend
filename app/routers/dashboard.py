# app/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.utils.auth import get_current_active_user
from app.models.usuario import Usuario
from app.models.ingreso import Ingreso
from app.models.gasto_fijo import GastoFijo
from app.models.deuda import Deuda  # <--- IMPORTANTE: Importar el modelo Deuda

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/resumen") # Cambiado a /resumen para que coincida con tu frontend
def get_resumen(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    # 1. Sumar ingresos
    total_ingresos = db.query(func.sum(Ingreso.monto)).filter(
        Ingreso.propietario_id == current_user.id
    ).scalar() or 0.0

    # 2. Sumar gastos fijos
    total_gastos = db.query(func.sum(GastoFijo.monto)).filter(
        GastoFijo.propietario_id == current_user.id
    ).scalar() or 0.0

    # 3. Sumar DEUDAS (Lo que faltaba)
    # Sumamos el monto_total de las deudas activas del usuario
    total_deudas = db.query(func.sum(Deuda.monto_total)).filter(
        Deuda.propietario_id == current_user.id
    ).scalar() or 0.0

    # 4. Cálculo del sueldo disponible (Para el widget verde de Metas)
    sueldo_disponible = total_ingresos - total_gastos

    return {
        "usuario": current_user.nombre,
        "total_ingresos": float(total_ingresos),
        "total_gastos": float(total_gastos),
        "total_deudas": float(total_deudas), # <--- Ahora el frontend verá el monto real
        "sueldo_disponible": float(sueldo_disponible), # <--- Lo que usa el widget de Metas
        "balance": float(sueldo_disponible),
        "moneda": "COP"
    }