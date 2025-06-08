import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

function EditBookForm({ book, onClose, onUpdate }) {
  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description);
  const [imageUrl, setImageUrl] = useState(book.image);
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", imageUrl);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/books/${book._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const updatedBook = await res.json();
      onUpdate(updatedBook);
      onClose();
    } catch (err) {
      alert("Error al actualizar el libro");
      console.error(err);
    }
  };

  return (
    <div
        className="fixed inset-0 flex justify-center items-center z-50 bg-cover bg-center"
        style={{
            backgroundImage: "url('/background.jpeg')",
            backdropFilter: "brightness(0.7)",
        }}
    >


      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl space-y-4 max-w-lg w-full"
      >
        <h2 className="text-2xl font-bold text-amber-800 text-center">Editar Libro</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full p-3 bg-gray-50 rounded shadow-inner"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
          className="w-full p-3 bg-gray-50 rounded shadow-inner resize-none"
        />

        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="URL de imagen"
          className="w-full p-3 bg-gray-50 rounded shadow-inner"
        />

        <div className="bg-gray-50 rounded shadow-inner p-3">
          <label className="block text-sm text-gray-600">Reemplazar PDF (opcional)</label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:underline"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditBookForm;
