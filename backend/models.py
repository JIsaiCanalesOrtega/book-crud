from pydantic import BaseModel, Field
from typing import Optional

class Book(BaseModel):
    id: Optional[str] = Field(alias="_id")  # <- importante si se devuelve desde MongoDB
    title: str
    category_id: str
    author_id: str
    description: Optional[str]
    image: Optional[str]
    file_path: Optional[str]
    user_id: Optional[str]

    class Config:
        orm_mode = True
        allow_population_by_field_name = True  # para que "_id" pueda usarse como "id"

class Author(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    bio: Optional[str]
    image: Optional[str]

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class Category(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    description: Optional[str]

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    profile_image: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserPublic(BaseModel):
    id: Optional[str] = Field(alias="_id")
    username: str
    email: str
    profile_image: Optional[str] = None

