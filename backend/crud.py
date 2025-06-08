from .database import book_collection, autor_collection, category_collection, user_collection
from bson import ObjectId


#Crud libros

def get_all_books():
    books = list(book_collection.find())
    for book in books:
        book["_id"] = str(book["_id"])
        book["author_id"] = str(book["author_id"])
        book["category_id"] = str(book["category_id"])
        if "user_id" in book:
            book["user_id"] = str(book["user_id"])
    return books


def insert_book(data: dict):
    result = book_collection.insert_one(data)
    return str(result.inserted_id)

def delete_book(id: str):
    result = book_collection.delete_one({"_id": ObjectId(id)})
    return result.deleted_count

#Crud autores
def get_all_authors():
    authors = list(autor_collection.find())
    for author in authors:
        author["_id"] = str(author["_id"])
    return authors

def insert_author(data: dict):
    result = autor_collection.insert_one(data)
    return str(result.inserted_id)

def delete_author(id: str):
    result = autor_collection.delete_one({"_id": ObjectId(id)})
    return result.deleted_count

#Crud categorias
def get_all_categories():
    categories = list(category_collection.find())
    for category in categories:
        category["_id"] = str(category["_id"])
    return categories

def insert_category(data: dict):
    result = category_collection.insert_one(data)
    return str(result.inserted_id)

def get_user_by_email(email: str):
    return user_collection.find_one({"email": email})

def insert_user(data: dict):
    result = user_collection.insert_one(data)
    return str(result.inserted_id)

def get_user_by_username(username: str):
    return user_collection.find_one({"username": username})

from bson import ObjectId

def update_user(id: str, data: dict):
    result = user_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )
    return result.modified_count

