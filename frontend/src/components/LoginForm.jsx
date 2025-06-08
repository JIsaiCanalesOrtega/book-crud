import React, { useState } from "react";

function LoginForm({ onLogin = () => {} }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState(null);

  const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data?.detail || "Error al iniciar sesión";
        throw new Error(message);
      }

      localStorage.setItem("token", data.access_token);
      setMsg("✅ Sesión iniciada");
      if (typeof onLogin === "function") onLogin();
      window.location.href = "/"; // Redirigir al inicio
    } catch (err) {
      if (err instanceof Error) {
        setMsg("❌ " + err.message);
      } else {
        setMsg("❌ Error inesperado");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow space-y-4"
    >
      <h2 className="text-xl font-semibold">Iniciar sesión</h2>

      <input
        type="email"
        placeholder="Correo"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />

      <button
        type="button"
        onClick={() => (window.location.href = "/register")}
        className="relative text-blue-400 block w-full mb-2 px-2 py-1 overflow-hidden
             transition-all duration-300 ease-in-out
             before:content-[''] before:absolute before:inset-0 before:scale-x-0 before:bg-blue-400
             before:origin-left before:transition-transform before:duration-300
             hover:before:scale-x-100"
      >
        <span className="relative z-10 transition-colors duration-300 hover:text-white">
          ¿No tienes cuenta? Crea una
        </span>
      </button>

      <button
        type="submit"
        className="bg-amber-800 text-white block w-full px-4 py-2 rounded shadow-md hover:shadow-lg transition-shadow duration-300 "
      >
        Ingresar
      </button>
      {msg && <p className="text-sm text-center mt-2">{msg}</p>}
    </form>
  );
}

export default LoginForm;
