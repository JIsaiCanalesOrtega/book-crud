import os
from fastapi import UploadFile, Header, HTTPException
from passlib.context import CryptContext
from jose import jwt, JWTError
from bson import ObjectId
from datetime import datetime, timedelta
from .database import db  # Asegúrate de que tu conexión a MongoDB esté configurada correctamente
#from .crud import db  # Ajusta si tu conexión a Mongo está en otro archivo

# 🔐 Seguridad para contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# 📦 Guardar archivos PDF
UPLOAD_DIR = "uploads"

def save_pdf(fille: UploadFile) -> str:
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    
    file_path = os.path.join(UPLOAD_DIR, fille.filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(fille.file.read())
    
    return file_path

# 🔑 JWT
SECRET_KEY = "clave-supersecreta"  # cámbiala por una más fuerte en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

# 🧑‍💻 Extraer usuario desde el token (para Depends)
def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token sin ID de usuario")

    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return user
