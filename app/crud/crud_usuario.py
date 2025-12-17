# app/crud/crud_usuario.py
from sqlalchemy.orm import Session
from ..models.usuario import Usuario
from ..schemas.usuario import UsuarioCreate, UsuarioUpdate
from ..utils.auth import get_password_hash # Necesario para el registro

# ------------------------------------------------
# READ
# ------------------------------------------------

def get_usuario(db: Session, usuario_id: int):
    """Obtiene un usuario por su ID."""
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str):
    """Obtiene un usuario por su email."""
    return db.query(Usuario).filter(Usuario.email == email).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene una lista de usuarios."""
    return db.query(Usuario).offset(skip).limit(limit).all()

# ------------------------------------------------
# CREATE
# ------------------------------------------------

def create_usuario(db: Session, user: UsuarioCreate):
    """Crea un nuevo usuario en la base de datos."""
    hashed_password = get_password_hash(user.password)
    
    db_user = Usuario(
        nombre=user.nombre,
        email=user.email,
        password_hash=hashed_password,
        rol=user.rol or "Miembro",
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ------------------------------------------------
# UPDATE
# ------------------------------------------------

def update_usuario(db: Session, db_user: Usuario, user_in: UsuarioUpdate):
    """Actualiza la información de un usuario existente."""
    update_data = user_in.model_dump(exclude_unset=True)

    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))

    for key, value in update_data.items():
        # Usar getattr para actualizar solo las propiedades que existen en el modelo
        if hasattr(db_user, key):
            setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

# ------------------------------------------------
# DELETE
# ------------------------------------------------

def delete_usuario(db: Session, usuario_id: int):
    """Elimina un usuario por su ID."""
    db_user = get_usuario(db, usuario_id)
    
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
        
    return False