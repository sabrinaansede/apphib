import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [usuario, setUsuario] = useState(null);
  const [lugares, setLugares] = useState([]);
  const initialTecnicas = [
    {
      id: "respiracion",
      titulo: "Respiración 4-7-8",
      desc: "Inhalá 4s, retené 7s, exhalá 8s para reducir ansiedad.",
      img: "https:",
      tags: ["respiración", "calma"],
      steps: [
        "Encontrá un lugar cómodo y apoyá la espalda.",
        "Inhalá por la nariz contando 4.",
        "Retené el aire contando 7.",
        "Exhalá suave por la boca contando 8.",
        "Repetí 4 ciclos.",
      ],
      source: "https://undraw.co/illustrations",
    },
    {
      id: "presion-profunda",
      titulo: "Presión profunda",
      desc: "Usá mantas pesadas o un chaleco para aportar contención.",
      img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
      tags: ["sensorial", "propiocepción"],
      steps: [
        "Elegí una manta pesada adecuada (10% del peso aprox).",
        "Cubrí hombros y tronco de forma uniforme.",
        "Mantené 10–15 minutos observando confort.",
        "Retirá si hay incomodidad o calor.",
      ],
      source: "https://storyset.com/",
    },
    {
      id: "ruido-blanco",
      titulo: "Ruido blanco",
      desc: "Auriculares con ruido blanco o sonidos suaves.",
      img: "https://images.unsplash.com/photo-1518441902110-9f89f7e83cd0?q=80&w=1200&auto=format&fit=crop",
      tags: ["auditivo", "calma"],
      steps: [
        "Colocá auriculares cómodos.",
        "Elegí ruido blanco/lluvia/olas a volumen bajo.",
        "Probá 5–10 minutos y ajustá si es necesario.",
      ],
      source: "https://www.freepik.com/vectors/illustrations",
    },
    {
      id: "rincon-calmo",
      titulo: "Rincón calmo",
      desc: "Espacio con luz tenue, texturas suaves y pocos estímulos.",
      img: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1200&auto=format&fit=crop",
      tags: ["ambiente", "regulación"],
      steps: [
        "Elegí un rincón lejos de ruidos y paso.",
        "Sumá almohadones y manta suave.",
        "Iluminación cálida y tenue.",
        "Guardá allí juguetes sensoriales favoritos.",
      ],
      source: "https://undraw.co/illustrations",
    },
    {
      id: "juguetes-sensoriales",
      titulo: "Juguetes sensoriales",
      desc: "Pelotas antiestrés, fidget spinners o masas táctiles.",
      img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop",
      tags: ["táctil", "sensorial"],
      steps: [
        "Seleccioná 2–3 juguetes preferidos.",
        "Usalos 3–5 minutos para descargar tensión.",
        "Guardalos en una caja accesible.",
      ],
      source: "https://storyset.com/",
    },
    {
      id: "rutinas-visuales",
      titulo: "Rutinas visuales",
      desc: "Secuencias con pictogramas para anticipar actividades.",
      img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop",
      tags: ["visual", "estructura"],
      steps: [
        "Elegí 3–5 actividades del día.",
        "Representalas con pictogramas o dibujos.",
        "Mostrá el orden e id marcando las realizadas.",
      ],
      source: "https://www.freepik.com/vectors/illustrations",
    },
  ];
  const [tecnicas, setTecnicas] = useState(initialTecnicas);

  // Uploader de técnica personalizada
  const [newTec, setNewTec] = useState({ titulo: "", desc: "", tags: "", file: null, imgUrl: "" });
  const onNewFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setNewTec((p) => ({ ...p, file, imgUrl: url }));
  };
  const addTecnica = (e) => {
    e.preventDefault();
    if (!newTec.imgUrl) return;
    const id = `custom_${Date.now()}`;
    const tags = newTec.tags
      ? newTec.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : ["personalizada"];
    const card = {
      id,
      titulo: newTec.titulo || "Técnica personalizada",
      desc: newTec.desc || "",
      img: newTec.imgUrl,
      tags,
      steps: ["Seguí los pasos preferidos para tu autorregulación."],
      source: "archivo local",
    };
    setTecnicas((prev) => [card, ...prev]);
    setNewTec({ titulo: "", desc: "", tags: "", file: null, imgUrl: "" });
    // Nota: podríamos revocar el ObjectURL al desmontar o al reemplazar.
  };

  // Favoritos (localStorage)
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("fav_tecnicas") || "[]")); } catch { return new Set(); }
  });
  const toggleFav = (id) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem("fav_tecnicas", JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  // Modal guía
  const [openTec, setOpenTec] = useState(null);
  const openGuide = (t) => setOpenTec(t);
  const closeGuide = () => setOpenTec(null);

  // Mantenerse en Inicio aunque esté logueado (sin auto-redirect)
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

  // Si está logueado, traer algunos lugares destacados
  useEffect(() => {
    const fetchLugares = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/lugares`);
        setLugares(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch {}
    };
    if (usuario) fetchLugares();
  }, [usuario]);

  // Estados Login
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");

  // Estados Registro
  const [regForm, setRegForm] = useState({
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    tipoUsuario: "padre",
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regMsg, setRegMsg] = useState("");

  const onLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((p) => ({ ...p, [name]: value }));
  };
  const onRegChange = (e) => {
    const { name, value } = e.target;
    setRegForm((p) => ({ ...p, [name]: value }));
  };

  const doLogin = async (credentials) => {
    const { data } = await axios.post(`${API_URL}/api/usuarios/login`, credentials);
    localStorage.setItem("usuario", JSON.stringify(data.user));
    window.dispatchEvent(new Event("storage"));
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMsg("");
    try {
      await doLogin(loginForm);
      setLoginMsg("Inicio de sesión exitoso");
      setTimeout(() => navigate("/", { replace: true }), 400);
    } catch (err) {
      setLoginMsg(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoginLoading(false);
    }
  };

  const submitRegistro = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegMsg("");
    try {
      const res = await axios.post(`${API_URL}/api/usuarios/register`, regForm);
      if (res.status === 201) {
        setRegMsg("Cuenta creada. Ingresando...");
        // Auto-login con las mismas credenciales
        await doLogin({ email: regForm.email, password: regForm.password });
        setTimeout(() => navigate("/", { replace: true }), 500);
      }
    } catch (err) {
      setRegMsg(err.response?.data?.message || "Error al crear cuenta");
    } finally {
      setRegLoading(false);
    }
  };

  // Render condicional según autenticación
  if (!usuario) {
    return (
      <div className="home-page">
        <div className="home-container">
          <div className="home-hero">
            <h1 className="home-title">Bienvenid@ a Lugares Seguros</h1>
            <p className="home-subtitle">Iniciá sesión o creá tu cuenta para acceder al mapa y contribuir con la comunidad.</p>
          </div>

          <div className="home-tabs">
            <div className="home-tabs-inner">
              <button
                className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Iniciar sesión
              </button>
              <button
                className={`tab-btn ${activeTab === "registro" ? "active" : ""}`}
                onClick={() => setActiveTab("registro")}
              >
                Crear cuenta
              </button>
            </div>
          </div>

          <div className="home-grid">
            {/* Card Login */}
            <div className="card" style={{ opacity: activeTab === "login" ? 1 : 0.6 }}>
              <h2 className="card-title">Ingresá a tu cuenta</h2>
              <form onSubmit={submitLogin} className="form">
                <div className="form-group">
                  <label className="label">Email</label>
                  <input type="email" name="email" value={loginForm.email} onChange={onLoginChange} required className="input" />
                </div>
                <div className="form-group">
                  <label className="label">Contraseña</label>
                  <input type="password" name="password" value={loginForm.password} onChange={onLoginChange} required className="input" />
                </div>
                <button type="submit" disabled={loginLoading} className="btn btn-primary">
                  {loginLoading ? "Ingresando..." : "Ingresar"}
                </button>
              </form>
              {loginMsg && (
                <p className={`msg ${loginMsg.includes("exitoso") ? "msg-success" : "msg-error"}`}>{loginMsg}</p>
              )}
            </div>

            {/* Card Registro */}
            <div className="card" style={{ opacity: activeTab === "registro" ? 1 : 0.6 }}>
              <h2 className="card-title">Creá tu cuenta</h2>
              <form onSubmit={submitRegistro} className="form">
                <div className="form-group">
                  <label className="label">Nombre</label>
                  <input type="text" name="nombre" value={regForm.nombre} onChange={onRegChange} required className="input" />
                </div>
                <div className="form-group">
                  <label className="label">Email</label>
                  <input type="email" name="email" value={regForm.email} onChange={onRegChange} required className="input" />
                </div>
                <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="label">Contraseña</label>
                    <input type="password" name="password" value={regForm.password} onChange={onRegChange} required className="input" />
                  </div>
                  <div className="form-group">
                    <label className="label">Teléfono</label>
                    <input type="text" name="telefono" value={regForm.telefono} onChange={onRegChange} className="input" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Tipo de usuario</label>
                  <select name="tipoUsuario" value={regForm.tipoUsuario} onChange={onRegChange} className="select">
                    <option value="padre">Padre</option>
                    <option value="persona">Persona</option>
                    <option value="local">Local</option>
                  </select>
                </div>
                <button type="submit" disabled={regLoading} className="btn btn-secondary">
                  {regLoading ? "Creando..." : "Crear cuenta"}
                </button>
              </form>
              {regMsg && (
                <p className={`msg ${regMsg.includes("cuenta") || regMsg.includes("Ingresando") ? "msg-success" : "msg-error"}`}>{regMsg}</p>
              )}
            </div>
          </div>

          

          
        </div>
      </div>
    );
  }

  // Vista de inicio para usuario autenticado
  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-hero">
          <h1 className="home-title">Hola {usuario?.nombre || ""} 👋</h1>
          <p className="home-subtitle">Explorá lugares certificados y de la comunidad. Podés agregar nuevos y ayudar a validar.</p>
        </div>

        <div className="home-tabs" style={{ marginBottom: 24 }}>
          <div className="home-tabs-inner">
            <button className="tab-btn active" onClick={() => navigate("/mapa")}>Ver mapa</button>
            <button className="tab-btn" onClick={() => navigate("/contacto")}>Contacto</button>
          </div>
        </div>

        {lugares && lugares.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <h2 className="card-title" style={{ margin: '0 0 12px 0' }}>Lugares destacados</h2>
            <div className="home-grid">
              {lugares.slice(0, 6).map((l) => (
                <div key={l._id} className="card">
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{l.nombre}</div>
                  <div style={{ color: '#64748b', marginBottom: 4 }}>{l.direccion}</div>
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>Tipo: {l.tipo || '—'} | Provincia: {l.provincia || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pinterest-section">
          <h2 className="pinterest-title">Técnicas de autorregulación</h2>
          <div className="pinterest-grid">
            {tecnicas.map((t) => (
              <div key={t.id} className="coach-card">
                <div className="coach-card-header">
                  <div className="coach-card-main">
                    <div className="coach-card-icon">🧠</div>
                    <div>
                      <div className="coach-card-title">{t.titulo}</div>
                      <div className="coach-card-tags">
                        {(t.tags || []).map((tag) => (
                          <span key={tag} className="coach-card-tag">#{tag}</span>
                        ))}
                        <span className="coach-card-tag">#bienestar</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="coach-card-fav"
                    aria-label="Favorito"
                    onClick={() => toggleFav(t.id)}
                  >
                    <svg
                      className="heart"
                      viewBox="0 0 24 24"
                      fill={favs.has(t.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 21s-6.716-4.297-9.428-7.009C.86 12.28.5 10.5 1.343 9.172 2.186 7.844 3.9 7 5.657 7c1.2 0 2.357.39 3.292 1.11L12 11l3.051-2.89C15.986 7.39 17.143 7 18.343 7c1.757 0 3.47.844 4.314 2.172.843 1.328.482 3.108-1.229 4.819C18.716 16.703 12 21 12 21z" />
                    </svg>
                  </button>
                </div>
                <div className="coach-card-body">{t.desc}</div>
                <div className="coach-card-footer">
                  <button
                    type="button"
                    className="coach-card-button"
                    onClick={() => openGuide(t)}
                  >
                    Ver guía paso a paso
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {openTec && (
          <div className="modal-backdrop" onClick={closeGuide}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">{openTec.titulo}</div>
                <button className="modal-close" onClick={closeGuide}>×</button>
              </div>
              <div className="modal-body">
                <img className="modal-img" src={openTec.img} alt={openTec.titulo} />
                <div>
                  <p className="pin-desc" style={{display:'block', color:'#475569', margin:'0 0 10px'}}>{openTec.desc}</p>
                  <div className="pin-tags" style={{ marginBottom: 10 }}>
                    {(openTec.tags || []).map((tag) => (
                      <span key={tag} className="pin-tag pin-teal">#{tag}</span>
                    ))}
                  </div>
                  <h4 className="modal-section-title">Pasos</h4>
                  <ol className="steps">
                    {(openTec.steps || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                  {openTec.source && (
                    <div>
                      <a className="source-link" href={openTec.source} target="_blank" rel="noreferrer">
                        Fuente / Ilustración
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
