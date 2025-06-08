import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

function MyBooks() {
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

  const handleDelete = async (bookId) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar este libro?");
    if (!confirm) return;

    try {
      const res = await fetch(`${API_BASE}/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar el libro");

      setBooks(prev => prev.filter(book => book._id !== bookId));
    } catch (err) {
      console.error("Error eliminando libro:", err);
      alert("No se pudo eliminar el libro.");
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

          <div className="mt-4 flex justify-between items-center">
            <a
              href={`${API_BASE}/${book.file_path}`}
              target="_blank"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              📄 Ver PDF
            </a>
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
