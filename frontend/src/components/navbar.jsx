import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("usuario");
      setUsuario(raw ? JSON.parse(raw) : null);
    } catch {}
    const onStorage = () => {
      try {
        const raw = localStorage.getItem("usuario");
        setUsuario(raw ? JSON.parse(raw) : null);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    // Notificar a componentes que escuchan cambios de sesión
    window.dispatchEvent(new Event("storage"));
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </Link>

        {/* Links */}
        <div className="nav-links">
          {usuario ? (
            <>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} end>
                Inicio
              </NavLink>
              <NavLink to="/mapa" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Mapa
              </NavLink>
              <NavLink to="/contacto" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Contacto
              </NavLink>
              <NavLink to="/mis-resenas" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Mis reseñas
              </NavLink>
              <button onClick={handleLogout} className="nav-button danger">Salir</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Iniciar sesión
              </NavLink>
              <NavLink to="/registro" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Crear cuenta
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
