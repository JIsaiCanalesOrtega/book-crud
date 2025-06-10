from fastapi import FastAPI, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from bson import ObjectId
from fastapi import Body
from motor.motor_asyncio import AsyncIOMotorClient  # Usamos Motor para MongoDB asincrónico
from . import crud, utils
from .models import (
    Book,
    Author,
    Category,
    UserPublic,
    UserCreate,
    UserLogin,
    UserUpdateModel  # Asegúrate de tener este modelo en models.py
)
from .utils import get_current_user

app = FastAPI()

# Conexión a MongoDB asincrónica usando Motor
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client.get_database()  # Usamos el nombre de la base de datos configurado en el .env

# CORS: permitir frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Subir libro
@app.post("/books/")
async def upload_book(
    title: str = Form(...),
    category_id: str = Form(...),
    author_id: str = Form(...),
    description: str = Form(""),
    image: str = Form(""),
    file: UploadFile = Form(...),
    user=Depends(get_current_user)
):
    file_path = utils.save_pdf(file)  # Asumimos que esta función guarda el archivo

    book_data = {
        "title": title,
        "category_id": category_id,
        "author_id": author_id,
        "description": description,
        "image": image,
        "file_path": file_path,
        "user_id": str(user["_id"])
    }

    book_id = crud.insert_book(book_data)  # Asegúrate de que esta función inserte el libro en MongoDB
    return {"id": book_id}


@app.get("/books/")
async def list_books():
    books = await crud.get_all_books()  # Asumimos que esta función es asincrónica
    return books


@app.get("/books/{book_id}")
async def get_book_file(book_id: str):
    books = await crud.get_all_books()  # Asumimos que esta función es asincrónica
    for book in books:
        if book["_id"] == book_id:
            return FileResponse(
                path=book["file_path"],
                filename=book["title"] + ".pdf",
                media_type="application/pdf"
            )
    raise HTTPException(status_code=404, detail="Libro no encontrado")


@app.delete("/books/{book_id}")
async def delete_book(book_id: str):
    deleted = await crud.delete_book(book_id)  # Asumimos que esta función es asincrónica
    if deleted:
        return {"deleted": True}
    else:
        raise HTTPException(status_code=404, detail="Libro no encontrado")


@app.post("/authors/")
async def create_author(author: Author):
    author_id = await crud.insert_author(author.dict())  # Asumimos que esta función es asincrónica
    return {"id": author_id}


@app.get("/authors/")
async def list_authors():
    authors = await crud.get_all_authors()  # Asumimos que esta función es asincrónica
    return authors


@app.delete("/authors/{author_id}")
async def delete_author(author_id: str):
    deleted = await crud.delete_author(author_id)  # Asumimos que esta función es asincrónica
    if deleted:
        return {"deleted": True}
    else:
        raise HTTPException(status_code=404, detail="Autor no encontrado")


@app.post("/categories/")
async def create_category(category: Category):
    category_id = await crud.insert_category(category.dict())  # Asumimos que esta función es asincrónica
    return {"id": category_id}


@app.get("/categories/")
async def list_categories():
    categories = await crud.get_all_categories()  # Asumimos que esta función es asincrónica
    return categories


# Obtener perfil del usuario actual
@app.get("/me", response_model=UserPublic)
async def get_me(user=Depends(get_current_user)):
    user["_id"] = str(user["_id"])
    return user

# Actualizar perfil del usuario actual
@app.put("/me", response_model=UserPublic)
async def update_me(updated: UserUpdateModel, user=Depends(get_current_user)):
    if updated.username and updated.username != user["username"]:
        if await crud.get_user_by_username(updated.username):  # Asumimos que esta función es asincrónica
            raise HTTPException(status_code=400, detail="Nombre de usuario ya en uso")

    updated_data = {k: v for k, v in updated.dict().items() if v is not None}
    await crud.update_user(user["_id"], updated_data)  # Asumimos que esta función es asincrónica

    user.update(updated_data)
    user["_id"] = str(user["_id"])
    return user


@app.post("/register")
async def register(user: UserCreate):
    if await crud.get_user_by_email(user.email):  # Asumimos que esta función es asincrónica
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pwd = utils.hash_password(user.password)
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_pwd
    }
    await crud.insert_user(user_data)  # Asumimos que esta función es asincrónica
    return {"message": "Usuario creado con éxito"}


@app.post("/login")
async def login(user: UserLogin):
    db_user = await crud.get_user_by_email(user.email)  # Asumimos que esta función es asincrónica
    if not db_user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    if not utils.verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    token = utils.create_access_token({"sub": str(db_user["_id"])})
    return {"access_token": token}


# ✅ MONTAJE DE ARCHIVOS ESTÁTICOS
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/users/{user_id}", response_model=UserPublic)
async def get_user(user_id: str):
    user = await crud.get_user_by_id(user_id)  # Asumimos que esta función es asincrónica
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user["_id"] = str(user["_id"])
    return user


@app.put("/books/{book_id}")
async def update_book(
    book_id: str,
    title: str = Form(...),
    description: str = Form(""),
    image: str = Form(""),
    file: UploadFile = None,
    user=Depends(get_current_user)
):
    book = await crud.get_book_by_id(book_id)  # Asumimos que esta función es asincrónica
    if not book:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    if str(book["user_id"]) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="No autorizado")

    update_data = {
        "title": title,
        "description": description,
        "image": image
    }

    if file:
        if os.path.exists(book["file_path"]):
            os.remove(book["file_path"])  # Eliminamos el archivo antiguo de manera asincrónica
        update_data["file_path"] = utils.save_pdf(file)  # Asumimos que esta función guarda el archivo

    await crud.update_book(book_id, update_data)  # Asumimos que esta función es asincrónica
    book.update(update_data)
    book["_id"] = str(book["_id"])
    return book
