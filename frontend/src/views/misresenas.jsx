import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MisResenas = () => {
  const [reseñas, setReseñas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("usuario") || "null"); } catch { return null; }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMensaje("");
      try {
        const res = await fetch(`${API_URL}/api/resenas`);
        const json = await res.json();
        const all = Array.isArray(json) ? json : (json.data || []);
        const uid = usuario?._id;
        const mine = uid ? all.filter(r => (r.usuario?._id || r.usuario) === uid) : [];
        setReseñas(mine);
      } catch (e) {
        setMensaje("❌ Error al cargar tus reseñas");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuario]);

  if (!usuario) {
    return (
      <div className="home-page">
        <div className="home-container">
          <div className="home-hero">
            <h1 className="home-title">Mis reseñas</h1>
            <p className="home-subtitle">Iniciá sesión para ver tus reseñas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-hero">
          <h1 className="home-title">Mis reseñas</h1>
          <p className="home-subtitle">Tus opiniones sobre los lugares visitados</p>
        </div>

        {loading && <div className="msg">Cargando…</div>}
        {mensaje && <div className="msg msg-error">{mensaje}</div>}
        {!loading && reseñas.length === 0 && (
          <div className="msg">Aún no has dejado reseñas.</div>
        )}

        <div className="home-grid">
          {reseñas.map((r) => (
            <div key={r._id} className="card">
              <div className="row-between">
                <div className="card-title">{typeof r.lugar === 'object' ? (r.lugar?.nombre || 'Lugar') : 'Lugar'}</div>
                <div className="text-muted">{new Date(r.creadoEn || r.createdAt || Date.now()).toLocaleDateString()}</div>
              </div>
              <div className="mb-2">Puntuación: <strong>{r.puntuacion} ⭐</strong></div>
              {r.comentario && <div className="text-secondary">{r.comentario}</div>}
              {r.fotoUrl && (
                <img src={r.fotoUrl} alt="foto reseña" className="resena-img" />
              )}
              {typeof r.lugar === 'object' && r.lugar?.direccion && (
                <div className="text-muted-light mt-2">{r.lugar.direccion}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MisResenas;
