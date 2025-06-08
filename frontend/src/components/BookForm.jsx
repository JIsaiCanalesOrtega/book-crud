import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

function BookForm() {
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorsRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE}/authors/`),
          fetch(`${API_BASE}/categories/`)
        ]);
        const authorsData = await authorsRes.json();
        const categoriesData = await categoriesRes.json();
        setAuthors(authorsData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        setAuthors([]);
        setCategories([]);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author_id", authorId);
    formData.append("category_id", categoryId);
    formData.append("description", description);
    formData.append("image", imageUrl);
    formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/books/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      alert("Libro subido correctamente");
      setTitle('');
      setAuthorId('');
      setCategoryId('');
      setDescription('');
      setImageUrl('');
      setFile(null);
    } catch (error) {
      alert("Error al subir libro");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md max-w-lg mx-auto p-8 space-y-5"
    >
      <h2 className="text-2xl font-serif font-bold text-center text-amber-800 mb-2">
        Subir Nuevo Libro
      </h2>

      <input
        type="text"
        placeholder="Título del libro"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full bg-gray-50 p-3 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500"
      />

      <select
        value={authorId}
        onChange={(e) => setAuthorId(e.target.value)}
        required
        className="w-full bg-gray-50 p-3 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="">Selecciona un autor</option>
        {authors.map((author) => (
          <option key={author._id} value={author._id}>
            {author.name}
          </option>
        ))}
      </select>

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        required
        className="w-full bg-gray-50 p-3 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="">Selecciona una categoría</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-gray-50 p-3 rounded-md shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
      />

      <input
        type="text"
        placeholder="URL de imagen (opcional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full bg-gray-50 p-3 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500"
      />

      <div className="bg-gray-50 rounded-md shadow-inner p-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className="w-full bg-white"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-amber-700 text-white py-3 rounded-md font-medium hover:bg-amber-800 transition-colors"
      >
        Subir libro
      </button>
    </form>
  );
}

export default BookForm;
