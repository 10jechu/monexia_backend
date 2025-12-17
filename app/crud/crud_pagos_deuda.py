from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.pagos_deuda import PagoDeuda
from ..models.deuda import Deuda 
from ..schemas.pagos_deuda import PagoDeudaCreate, PagoDeudaUpdate

# ------------------------------------------------
# READ
# ------------------------------------------------

def get_pago_deuda(db: Session, pago_deuda_id: int):
    """Obtiene un pago de deuda por su ID."""
    return db.query(PagoDeuda).filter(PagoDeuda.id == pago_deuda_id).first()

def get_pagos_by_deuda(db: Session, deuda_id: int, skip: int = 0, limit: int = 100):
    """Obtiene los pagos de una deuda específica."""
    return db.query(PagoDeuda).filter(PagoDeuda.deuda_id == deuda_id).offset(skip).limit(limit).all()

# ------------------------------------------------
# CREATE (Lógica del Simulador Financiero)
# ------------------------------------------------

def create_pago_deuda(db: Session, pago: PagoDeudaCreate):
    """
    Crea un nuevo pago. 
    Aplica lógica de amortización: calcula interés del periodo y lo resta del abono 
    antes de reducir el monto pendiente.
    """
    db_deuda = db.query(Deuda).filter(Deuda.id == pago.deuda_id).first()

    if not db_deuda:
        raise HTTPException(status_code=404, detail="Deuda principal no encontrada.")

    if db_deuda.monto_pendiente <= 0:
        raise HTTPException(status_code=400, detail="Esta deuda ya ha sido saldada.")

    # --- CÁLCULO MATEMÁTICO DEL SIMULADOR ---
    # 1. Calcular el interés generado por el saldo actual
    # Fórmula: Interés = Saldo Pendiente * (Tasa / 100)
    interes_del_periodo = db_deuda.monto_pendiente * (db_deuda.tasa_interes / 100)
    
    # 2. Determinar cuánto dinero va realmente a bajar la deuda (Capital)
    abono_a_capital = pago.monto_pago - interes_del_periodo

    if abono_a_capital <= 0:
        raise HTTPException(
            status_code=400, 
            detail=f"El pago es insuficiente. El interés acumulado es de ${interes_del_periodo:,.2f}"
        )

    # 3. No permitir abonos mayores a la deuda pendiente real
    if db_deuda.monto_pendiente < abono_a_capital:
        abono_a_capital = db_deuda.monto_pendiente

    # --- PERSISTENCIA EN BASE DE DATOS ---
    # Guardamos el registro del pago
    db_pago = PagoDeuda(**pago.model_dump())
    db.add(db_pago)
    
    # Actualizamos el saldo real de la deuda
    db_deuda.monto_pendiente -= abono_a_capital
    
    db.commit()
    db.refresh(db_pago)
    db.refresh(db_deuda)
    return db_pago

# ------------------------------------------------
# DELETE (Lógica de Reversión)
# ------------------------------------------------

def delete_pago_deuda(db: Session, pago_deuda_id: int):
    """
    Elimina un pago y revierte el monto al saldo pendiente.
    Nota: Se asume reversión a capital simple para mantener integridad.
    """
    db_pago = get_pago_deuda(db, pago_deuda_id)
    
    if db_pago:
        db_deuda = db.query(Deuda).filter(Deuda.id == db_pago.deuda_id).first()
        if db_deuda:
            # Re-calculamos el interés que se había cobrado para devolver el capital exacto
            interes_que_fue_cobrado = db_deuda.monto_pendiente * (db_deuda.tasa_interes / 100)
            reversion_capital = db_pago.monto_pago - interes_que_fue_cobrado
            
            # Devolvemos el monto al saldo pendiente
            db_deuda.monto_pendiente += max(0, reversion_capital)
            db.add(db_deuda)
            
        db.delete(db_pago)
        db.commit()
        return True
        
    return False