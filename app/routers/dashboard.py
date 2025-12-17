# app/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.utils.auth import get_current_active_user
from app.models.usuario import Usuario
from app.models.ingreso import Ingreso
from app.models.gasto_fijo import GastoFijo

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

# app/routers/dashboard.py

@router.get("/consolidado")
def get_consolidado(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    # 1. Sumar ingresos usando 'propietario_id'
    total_ingresos = db.query(func.sum(Ingreso.monto)).filter(
        Ingreso.propietario_id == current_user.id # <--- Cambiado aquí
    ).scalar() or 0.0

    # 2. Sumar gastos (Verifica si en gasto_fijo.py también se llama propietario_id)
    total_gastos = db.query(func.sum(GastoFijo.monto)).filter(
        GastoFijo.propietario_id == current_user.id # <--- Verifica este nombre en su modelo
    ).scalar() or 0.0

    balance = total_ingresos - total_gastos

    return {
        "usuario": current_user.nombre,
        "total_ingresos": float(total_ingresos),
        "total_gastos": float(total_gastos),
        "balance": float(balance),
        "mensaje": "¡Dashboard actualizado!",
        "moneda": "COP"
    }