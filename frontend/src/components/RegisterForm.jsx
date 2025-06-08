import React, { useState } from "react";

function RegisterForm() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState(null);

  const API_BASE = import.meta.env.PUBLIC_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error registrando");
      setMsg("✅ Usuario creado con éxito");
      setForm({ username: "", email: "", password: "" });
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Registro</h2>

      <input
        type="text"
        placeholder="Usuario"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        className="w-full p-2 border rounded"
        required
        autoComplete="username"
        aria-label="Nombre de usuario"
      />
      <input
        type="email"
        placeholder="Correo"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full p-2 border rounded"
        required
        autoComplete="email"
        aria-label="Correo electrónico"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="w-full p-2 border rounded"
        required
        autoComplete="new-password"
        aria-label="Contraseña"
      />

      <button
        type="submit"
        className="bg-amber-800 text-white block w-full px-4 py-2 rounded shadow-md hover:shadow-lg transition-shadow duration-300 "
      >
        Crear cuenta
      </button>

      <button
        type="button"
        onClick={() => (window.location.href = "/login")}
        className="relative text-blue-400 block w-full px-2 py-1 overflow-hidden
                   transition-all duration-300 ease-in-out
                   before:content-[''] before:absolute before:inset-0 before:scale-x-0 before:bg-blue-400
                   before:origin-left before:transition-transform before:duration-300
                   hover:before:scale-x-100"
      >
        <span className="relative z-10 transition-colors duration-300 hover:text-white">
          ¿Ya tienes cuenta? Inicia sesión
        </span>
      </button>

      {msg && (
        <div
          className={`text-sm text-center mt-2 ${
            msg.startsWith("✅") ? "text-green-600" : "text-red-500"
          }`}
        >
          {msg}
        </div>
      )}
    </form>
  );
}

export default RegisterForm;
