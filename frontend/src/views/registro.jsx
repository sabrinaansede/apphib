import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Registro = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    tipoUsuario: "padre", // valor por defecto
  });

  const [mensaje, setMensaje] = useState("");

  // Maneja cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Maneja el submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/api/usuarios/register`,
        formData
      );

      if (response.status === 201) {
        setMensaje("Usuario registrado correctamente");
        const { user, token } = response.data || {};
        if (user && token) {
          login(user, token);
          setTimeout(() => navigate("/", { replace: true }), 400);
        }
        setFormData({
          nombre: "",
          email: "",
          password: "",
          telefono: "",
          tipoUsuario: "padre",
        });
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.message) {
        setMensaje(error.response.data.message);
      } else {
        setMensaje("Error al registrar usuario");
      }
    }
  };

  return (
    <div className="registro-container">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
        />
        <select
          name="tipoUsuario"
          value={formData.tipoUsuario}
          onChange={handleChange}
        >
          <option value="padre">Padre</option>
          <option value="persona">Persona</option>
        </select>
        <button type="submit">Registrarse</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default Registro;
