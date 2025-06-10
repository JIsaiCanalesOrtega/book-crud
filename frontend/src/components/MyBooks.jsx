import React, { useEffect, useState } from "react";
import EditBookForm from "./EditBookForm";


const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

function MyBooks() {
  const [editingBook, setEditingBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        setError(null);

        // 1. Obtener usuario autenticado
        const resUser = await fetch(`${API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resUser.ok) throw new Error("No autenticado");

        const userData = await resUser.json();

        // 2. Obtener libros
        const resBooks = await fetch(`${API_BASE}/books/`);
        const allBooks = await resBooks.json();

        // 3. Filtrar por el usuario
        const myBooks = allBooks.filter(book => book.user_id === userData._id);
        setBooks(myBooks);
      } catch (err) {
        console.error("Error al cargar libros:", err);
        setError("No se pudieron cargar los libros.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyBooks();
    } else {
      setLoading(false);
    }
  }, [token]);

// ...todo tu código anterior
const handleEdit = async (book) => {
  const newTitle = prompt("Nuevo título:", book.title);
  if (newTitle === null || newTitle.trim() === "") return;

  const newDescription = prompt("Nueva descripción:", book.description);
  if (newDescription === null) return;

  try {
    const res = await fetch(`${API_BASE}/books/${book._id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        image: book.image, // puedes dejarlo editable más adelante
      }),
    });

    if (!res.ok) throw new Error("Error al actualizar el libro");

    const updatedBook = await res.json();

    setBooks(prev =>
      prev.map(b => (b._id === book._id ? updatedBook : b))
    );
  } catch (err) {
    console.error("Error actualizando libro:", err);
    alert("No se pudo actualizar el libro.");
  }
};

const handleDelete = async (bookId) => {
  // Mostrar confirmación antes de eliminar
  const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este libro?");
  if (!confirmDelete) return;

  try {
    // Enviar la solicitud DELETE al backend
    const res = await fetch(`${API_BASE}/books/${bookId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Asegúrate de enviar el token de autenticación si es necesario
      },
    });

    if (!res.ok) throw new Error("Error al eliminar el libro");

    // Filtrar el libro eliminado del estado de los libros
    setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));
    alert("Libro eliminado exitosamente");
  } catch (error) {
    console.error("Error al eliminar libro:", error);
    alert("No se pudo eliminar el libro");
  }
};



  if (loading) return <p className="text-center">Cargando tus libros...</p>;
  if (!token) return <p className="text-center text-red-500">Debes iniciar sesión.</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (books.length === 0) return <p className="text-center text-gray-500">No has subido libros aún.</p>;

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map(book => (
        <div key={book._id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-gray-800">{book.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{book.description}</p>

          {book.image && (
            <img
              src={book.image}
              alt={book.title}
              className="mt-4 rounded-lg object-cover w-full max-h-48"
            />
          )}

          {editingBook && (
            <EditBookForm
              book={editingBook}
              onClose={() => setEditingBook(null)}
              onUpdate={(updatedBook) =>
                setBooks((prev) =>
                  prev.map((b) => (b._id === updatedBook._id ? updatedBook : b))
                )
              }
            />
          )}

          <div className="mt-4 flex justify-between items-center">
            <a
              href={`${API_BASE}/${book.file_path}`}
              target="_blank"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              📄 Ver PDF
            </a>

            <button
              onClick={() => setEditingBook(book)}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
            >
              ✏️ Editar
            </button>

            <button
              onClick={() => handleDelete(book._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyBooks;
