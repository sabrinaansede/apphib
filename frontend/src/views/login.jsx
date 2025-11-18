import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    try {
      const { data } = await axios.post(`${API_URL}/api/usuarios/login`, form);
      // Guardar usuario y token en el contexto (y localStorage)
      login(data.user, data.token);
      setMensaje("Inicio de sesión exitoso");
      const redirectTo = location.state?.from?.pathname || "/";
      setTimeout(() => navigate(redirectTo, { replace: true }), 400);
    } catch (err) {
      if (err.response?.data?.message) setMensaje(err.response.data.message);
      else setMensaje("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      {mensaje && (
        <p className={`mt-3 text-center ${mensaje.includes("exitoso") ? "text-green-600" : "text-red-600"}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default Login;
