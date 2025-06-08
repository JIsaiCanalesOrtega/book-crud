import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const resBooks = await fetch(`${API_BASE}/books/`);
        const allBooks = await resBooks.json();

        if (!Array.isArray(allBooks)) {
          throw new Error("La respuesta no contiene una lista de libros.");
        }

        setBooks(allBooks);
      } catch (error) {
        console.error("Error cargando libros:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBooks();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <p className="text-center text-blue-500">Cargando libros...</p>;
  }

  if (!token) {
    return (
      <p className="text-center text-red-600 font-medium">
        ⚠️ No has iniciado sesión.
      </p>
    );
  }

  if (!books.length) {
    return (
      <p className="text-center text-gray-500 italic">
        No hay libros disponibles.
      </p>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <div
          key={book._id}
          className="relative group rounded-xl overflow-hidden shadow-md"
        >
          {book.image && (
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* Overlay oscuro al hacer hover */}
          <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center px-4">
            <h3 className="text-xl font-serif font-bold text-amber-300 mb-2">
              {book.title}
            </h3>
            <p className="text-sm text-amber-100">{book.description}</p>

            {book.file_path && (
              <a
                href={`/viewer?file=${encodeURIComponent(
                  `${API_BASE}/${book.file_path}`
                )}`}
                className="text-blue-600 underline text-sm hover:text-blue-800 transition-colors"
              >
                Ver PDF
              </a>
            )}
          </div>

          {/* Línea inferior con título */}
          <div className="bg-white text-center py-2 font-serif font-medium text-gray-800">
            {book.title}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BookList;
