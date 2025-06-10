from fastapi import FastAPI, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from bson import ObjectId
from fastapi import Body

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
    file_path = utils.save_pdf(file)

    book_data = {
        "title": title,
        "category_id": category_id,
        "author_id": author_id,
        "description": description,
        "image": image,
        "file_path": file_path,
        "user_id": str(user["_id"])
    }

    book_id = crud.insert_book(book_data)
    return {"id": book_id}


@app.get("/books/")
def list_books():
    return crud.get_all_books()


@app.get("/books/{book_id}")
def get_book_file(book_id: str):
    books = crud.get_all_books()
    for book in books:
        if book["_id"] == book_id:
            return FileResponse(
                path=book["file_path"],
                filename=book["title"] + ".pdf",
                media_type="application/pdf"
            )
    return {"error": "Book not found"}


@app.delete("/books/{book_id}")
def delete_book(book_id: str):
    deleted = crud.delete_book(book_id)
    return {"deleted": deleted}


@app.post("/authors/")
def create_author(author: Author):
    return {"id": crud.insert_author(author.dict())}


@app.get("/authors/")
def list_authors():
    return crud.get_all_authors()


@app.delete("/authors/{author_id}")
def delete_author(author_id: str):
    deleted = crud.delete_author(author_id)
    return {"deleted": deleted}


@app.post("/categories/")
def create_category(category: Category):
    return {"id": crud.insert_category(category.dict())}


@app.get("/categories/")
def list_categories():
    return crud.get_all_categories()


# Obtener perfil del usuario actual
@app.get("/me", response_model=UserPublic)
def get_me(user=Depends(get_current_user)):
    user["_id"] = str(user["_id"])
    return user

# Actualizar perfil del usuario actual
@app.put("/me", response_model=UserPublic)
def update_me(updated: UserUpdateModel, user=Depends(get_current_user)):
    if updated.username and updated.username != user["username"]:
        if crud.get_user_by_username(updated.username):
            raise HTTPException(status_code=400, detail="Nombre de usuario ya en uso")

    updated_data = {k: v for k, v in updated.dict().items() if v is not None}
    crud.update_user(user["_id"], updated_data)

    user.update(updated_data)
    user["_id"] = str(user["_id"])
    return user


@app.post("/register")
def register(user: UserCreate):
    if crud.get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pwd = utils.hash_password(user.password)
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_pwd
    }
    crud.insert_user(user_data)
    return {"message": "Usuario creado con éxito"}


@app.post("/login")
def login(user: UserLogin):
    print("recibido de: ", user)
    db_user = crud.get_user_by_email(user.email)
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
def get_user(user_id: str):
    from .database import user_collection
    user = user_collection.find_one({"_id": ObjectId(user_id)})
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
    from .database import book_collection
    from bson import ObjectId

    book = book_collection.find_one({"_id": ObjectId(book_id)})
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
        import os
        from . import utils
        if os.path.exists(book["file_path"]):
            os.remove(book["file_path"])
        update_data["file_path"] = utils.save_pdf(file)

    book_collection.update_one({"_id": ObjectId(book_id)}, {"$set": update_data})
    book.update(update_data)
    book["_id"] = str(book["_id"])
    return book
