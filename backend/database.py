from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Cargar .env correctamente
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

print("🔍 Variables de entorno cargadas:")
for key, val in os.environ.items():
    if "MONGO" in key.upper():
        print(f"{key} = {val}")

MONGO_URI = os.getenv("MONGO_URI")
print("🔗 URI leída:", MONGO_URI)

if not MONGO_URI:
    raise ValueError("❌ No se encontró la URI de MongoDB en .env")

try:
    client = MongoClient(MONGO_URI)
    client.admin.command('ping')  # Verifica conexión
    print("✅ Conectado exitosamente a MongoDB Atlas")
except Exception as e:
    print("❌ Error al conectar a MongoDB:", e)
    raise e  # <- importante: relanza para evitar que se importe algo incompleto

db = client["book_crud"]
book_collection = db["books"]
autor_collection = db["authors"]
category_collection = db["categories"]
user_collection = db["users"]