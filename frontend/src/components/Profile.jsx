import React, { useState, useEffect } from "react";
import MyBooks from "./MyBooks";

const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

function Profile() {
  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [msg, setMsg] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
        setEditName(data.username || "");
        setEditImage(data.profile_image || "");
      } catch (err) {
        setMsg("❌ Error al cargar datos del usuario");
      }
    };

    if (token) loadUser();
  }, [token]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: editName,
          email: user.email,
          password: "placeholder",
          profile_image: editImage,
        }),
      });

      if (!res.ok) throw new Error("Nombre ya en uso o error al actualizar");

      const updated = await res.json();
      setUser(updated);
      setMsg("✅ Perfil actualizado");
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!user) return <p className="text-center">Cargando perfil...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-center">Tu perfil</h2>

      {msg && <p className="text-center text-sm">{msg}</p>}

      <div className="flex flex-col items-center space-y-4">
        {editImage && (
          <img
            src={editImage}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full object-cover"
          />
        )}

        <input
          type="text"
          placeholder="Nombre"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="text"
          placeholder="URL de imagen de perfil"
          value={editImage}
          onChange={(e) => setEditImage(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <button
          onClick={handleSave}
          className="bg-amber-700 text-white py-2 px-4 rounded hover:bg-amber-800 transition"
        >
          Guardar cambios
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          Cerrar sesión
        </button>
      </div>

      <hr className="my-6" />

      <h3 className="text-xl font-semibold">Tus libros</h3>
      <MyBooks />
    </div>
  );
}

export default Profile;
