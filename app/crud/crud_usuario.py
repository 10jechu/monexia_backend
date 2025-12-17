# app/crud/crud_usuario.py
from sqlalchemy.orm import Session
from ..models.usuario import Usuario
from ..schemas.usuario import UsuarioCreate, UsuarioUpdate
from ..utils.security import get_password_hash

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

def create_usuario(db: Session, usuario: UsuarioCreate):
    """Crea un nuevo usuario con la contraseña hasheada."""
    hashed_password = get_password_hash(usuario.password)
    
    db_usuario = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        rol=usuario.rol,
        password_hash=hashed_password,  # Se guarda el hash, no la plana
        activo=True
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

# ------------------------------------------------
# UPDATE
# ------------------------------------------------

def update_usuario(db: Session, db_user: Usuario, user_in: UsuarioUpdate):
    """Actualiza la información de un usuario existente."""
    update_data = user_in.model_dump(exclude_unset=True)

    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))

    for key, value in update_data.items():
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