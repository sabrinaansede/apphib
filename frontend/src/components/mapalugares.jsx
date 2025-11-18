import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../App.css";

// 🧭 Íconos personalizados
import apadeaIcon from "../assets/apadea.png";

// Base URL del backend (Vite)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const iconoApadea = L.divIcon({
  className: "icono-apadea",
  html: `<div class="pin"><img src="${apadeaIcon}" alt="APADEA"/></div>`,
  // 36px círculo + ~12px punta = 48px alto total aprox
  iconSize: [36, 48],
  // Anclar en la punta inferior
  iconAnchor: [18, 48],
  // Elevar popup un poco por encima del pin
  popupAnchor: [0, -44],
});

const iconoComunidad = L.divIcon({
  className: "icono-comunidad",
  html: `
    <div class="pin">
      <div class="badge">
        <svg class="glyph" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="currentColor" d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-3.866 0-7 2.239-7 5v3h14v-3c0-2.761-3.134-5-7-5z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -44],
});

export default function MapaLugares() {
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const [lugares, setLugares] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [filtros, setFiltros] = useState({
    q: "",
    tipo: "",
    provincia: "",
    certificado: "", // APADEA | Comunidad
    minRating: 0,
    inicial: "",
  });
  const [nuevoLugar, setNuevoLugar] = useState({
    nombre: "",
    direccion: "",
    latitud: null,
    longitud: null,
    tipo: "",
    provincia: "",
    descripcion: "",
    etiquetasSensoriales: [],
    certificadoPor: "Comunidad",
  });
  const [mensaje, setMensaje] = useState("");
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("usuario") || "null"); } catch { return null; }
  }, []);
  const [ratingComentarios, setRatingComentarios] = useState({}); // { [lugarId]: string }
  const [detalleLugar, setDetalleLugar] = useState(null);
  const cerrarDetalle = () => setDetalleLugar(null);
  const [resenaForm, setResenaForm] = useState({ puntuacion: 0, comentario: "" });
  const [fotoUI, setFotoUI] = useState({ open: false, file: null, preview: "" });
  // UI: menús y orden
  const [menuOpen, setMenuOpen] = useState(null); // 'show' | 'sort' | 'filters' | null
  const [sortKey, setSortKey] = useState("default"); // 'default' | 'name' | 'rating'

  // Normalizar certificación del lugar (compatibilidad con datos antiguos)
  const getCert = (l) => (l.certificacion || l.certificadoPor || "Comunidad");

  // 🔹 Cargar lugares desde backend
  useEffect(() => {
    const cargarLugares = async () => {
      try {
        const res = await fetch(`${API_URL}/api/lugares`);
        const data = await res.json();
        setLugares(Array.isArray(data) ? data : data.data || data);
      } catch (err) {
        console.error("Error al cargar lugares:", err);
        setMensaje("❌ Error al cargar los lugares del mapa.");
      }
    };
    cargarLugares();
  }, []);

  // 🔹 Cargar reseñas/calificaciones
  useEffect(() => {
    const cargarResenas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/resenas`);
        const data = await res.json();
        setResenas(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Error al cargar reseñas:", err);
      }
    };
    cargarResenas();
  }, []);

  // 🔹 Promedio de rating por lugar
  const ratingPorLugar = useMemo(() => {
    const map = new Map(); // idLugar -> {sum, count}
    resenas.forEach((r) => {
      const id = r.lugar?._id || r.lugar;
      if (!id) return;
      const prev = map.get(id) || { sum: 0, count: 0 };
      map.set(id, { sum: prev.sum + (r.puntuacion || 0), count: prev.count + 1 });
    });
    const result = {};
    map.forEach((v, k) => { result[k] = { avg: v.count ? v.sum / v.count : 0, count: v.count }; });
    return result;
  }, [resenas]);

  // 🔹 Capturar clic en el mapa para obtener coordenadas
  function ClickMarker() {
    useMapEvents({
      click(e) {
        setNuevoLugar((prev) => ({
          ...prev,
          latitud: e.latlng.lat,
          longitud: e.latlng.lng,
        }));
      },
    });
    return null;
  }

  // 🔹 Agregar nuevo lugar
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoLugar.nombre || !nuevoLugar.direccion || !nuevoLugar.latitud || !nuevoLugar.longitud) {
      const faltantes = [];
      if (!nuevoLugar.nombre) faltantes.push("nombre");
      if (!nuevoLugar.direccion) faltantes.push("dirección");
      if (!nuevoLugar.latitud || !nuevoLugar.longitud) faltantes.push("ubicación en el mapa");
      setMensaje(`⚠️ Falta completar: ${faltantes.join(", ")}.`);
      return;
    }

    try {
      // Solo enviar campos que el backend define en el esquema
      const payload = {
        nombre: nuevoLugar.nombre,
        direccion: nuevoLugar.direccion,
        latitud: nuevoLugar.latitud,
        longitud: nuevoLugar.longitud,
        tipo: nuevoLugar.tipo || "",
        provincia: nuevoLugar.provincia || "",
        descripcion: nuevoLugar.descripcion || "",
        etiquetasSensoriales: nuevoLugar.etiquetasSensoriales || [],
        certificacion: nuevoLugar.certificadoPor || "Comunidad",
      };

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/lugares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Volver a cargar desde servidor para asegurarnos que quedó persistido
        try {
          const re = await fetch(`${API_URL}/api/lugares`);
          const lista = await re.json();
          const arr = Array.isArray(lista) ? lista : (lista.data || lista);
          setLugares(arr);
          // Intentar localizar el nuevo lugar con las mismas coords
          const recien = arr.find((l) => Number(l.latitud) === Number(payload.latitud) && Number(l.longitud) === Number(payload.longitud) && (l.nombre === payload.nombre));
          if (recien && markerRefs.current[recien._id]?.openPopup) {
            // Abrir popup luego de un pequeño delay para asegurar render
            setTimeout(() => markerRefs.current[recien._id].openPopup(), 200);
          }
        } catch {}
        setMensaje("✅ Lugar agregado correctamente.");
        // Centrar el mapa en el nuevo lugar
        if (mapRef.current && payload.latitud && payload.longitud) {
          const z = Math.max(mapRef.current.getZoom?.() || 13, 15);
          mapRef.current.setView([payload.latitud, payload.longitud], z, { animate: true });
        }
        // Resetear filtros para que no quede oculto
        setFiltros({ q: "", tipo: "", provincia: "", certificado: "", minRating: 0 });
        setNuevoLugar({
          nombre: "",
          direccion: "",
          latitud: null,
          longitud: null,
          tipo: "",
          provincia: "",
          descripcion: "",
          etiquetasSensoriales: [],
          certificadoPor: "Comunidad",
        });
      } else {
        const msg = data?.error || data?.message || `Error ${res.status}`;
        setMensaje(`❌ Error al agregar lugar: ${msg}`);
      }
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al conectar con el servidor.");
    }
  };

  // 🔹 Votar para validar lugar
  const votarLugar = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/lugares/${id}/votar`, {
        method: "PUT",
      });
      const data = await res.json();
      if (res.ok) {
        setLugares((prev) => prev.map((l) => (l._id === data._id ? data : l)));
      }
    } catch (err) {
      console.error("Error al votar:", err);
    }
  };

  // 🔹 Enviar calificación
  const enviarRating = async (lugarId, puntuacion, comentario = "") => {
    if (!usuario?._id) {
      setMensaje("⚠️ Debes iniciar sesión para calificar.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/resenas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ lugar: lugarId, usuario: usuario._id, puntuacion, comentario }),
      });
      const data = await res.json();
      if (res.ok) {
        setResenas((prev) => [...prev, data.data || data]);
      } else {
        setMensaje("❌ No se pudo enviar la calificación.");
      }
    } catch (e) {
      console.error(e);
      setMensaje("❌ Error al calificar.");
    }
  };

  // Enviar reseña desde modal con posible foto (multipart)
  const enviarResenaModal = async () => {
    if (!usuario?._id || !detalleLugar?._id) {
      setMensaje("⚠️ Debes iniciar sesión para dejar reseña.");
      return;
    }
    if (!resenaForm.puntuacion) return;
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("lugar", detalleLugar._id);
      fd.append("usuario", usuario._id);
      fd.append("puntuacion", String(resenaForm.puntuacion));
      if (resenaForm.comentario) fd.append("comentario", resenaForm.comentario);
      if (fotoUI.file) fd.append("foto", fotoUI.file);
      const res = await fetch(`${API_URL}/api/resenas`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setResenas((prev) => [...prev, data.data || data]);
        setResenaForm({ puntuacion: 0, comentario: "" });
        setFotoUI({ open: false, file: null, preview: "" });
      } else {
        setMensaje("❌ No se pudo enviar la reseña.");
      }
    } catch (e) {
      console.error(e);
      setMensaje("❌ Error al enviar la reseña.");
    }
  };

  // 🔹 Derivar listas para selects
  const tipos = useMemo(() => Array.from(new Set(lugares.map((l) => l.tipo).filter(Boolean))), [lugares]);
  const provincias = useMemo(() => Array.from(new Set(lugares.map((l) => l.provincia).filter(Boolean))), [lugares]);

  // 🔹 Aplicar filtros
  const lugaresFiltrados = useMemo(() => {
    return lugares.filter((l) => {
      const rating = ratingPorLugar[l._id]?.avg || 0;
      if (filtros.q) {
        const q = filtros.q.toLowerCase();
        const hit = (l.nombre || "").toLowerCase().includes(q) || (l.direccion || "").toLowerCase().includes(q) || (l.descripcion || "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filtros.tipo && l.tipo !== filtros.tipo) return false;
      if (filtros.provincia && l.provincia !== filtros.provincia) return false;
      if (filtros.certificado) {
        const cert = getCert(l) === "APADEA" ? "APADEA" : "Comunidad";
        if (cert !== filtros.certificado) return false;
      }
      if (filtros.inicial) {
        const first = (l.nombre || "").trim().charAt(0).toUpperCase();
        if (first !== filtros.inicial.toUpperCase()) return false;
      }
      if (rating < (Number(filtros.minRating) || 0)) return false;
      return true;
    });
  }, [lugares, filtros, ratingPorLugar]);

  // Lista ordenada para el panel lateral
  const listaOrdenada = useMemo(() => {
    const arr = [...lugaresFiltrados];
    if (sortKey === "name") {
      arr.sort((a,b) => (a.nombre||"").localeCompare(b.nombre||""));
    } else if (sortKey === "rating") {
      arr.sort((a,b) => (ratingPorLugar[b._id]?.avg||0) - (ratingPorLugar[a._id]?.avg||0));
    }
    return arr;
  }, [lugaresFiltrados, sortKey, ratingPorLugar]);

  return (
    <div className="container-mapa-form">
      {/* 🗺️ Mapa */}
      <MapContainer center={[-34.6037, -58.3816]} zoom={13} className="mapa-leaflet" whenCreated={(map) => (mapRef.current = map)}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <ClickMarker />

        {/* 📍 Marcadores */}
        {lugaresFiltrados.map((lugar) => (
          <Marker
            key={lugar._id}
            position={[lugar.latitud, lugar.longitud]}
            icon={getCert(lugar) === "APADEA" ? iconoApadea : iconoComunidad}
            ref={(ref) => { if (ref) markerRefs.current[lugar._id] = ref; }}
          >
            <Popup>
              <strong>{lugar.nombre}</strong>
              <br />
              {lugar.direccion}
              <br />
              Tipo: {lugar.tipo || "—"} | Provincia: {lugar.provincia || "—"}
              <br />
              Certificado por: {getCert(lugar)}
              <br />
              Etiquetas: {lugar.etiquetasSensoriales.join(", ")}
              <br />
              Calificación: {Number(ratingPorLugar[lugar._id]?.avg || 0).toFixed(1)} ⭐ ({ratingPorLugar[lugar._id]?.count || 0})
              <div className="star-row">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    onClick={() => enviarRating(lugar._id, n, ratingComentarios[lugar._id] || "")}
                    className="star-btn"
                  >
                    {n}⭐
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Comentario (opcional)"
                value={ratingComentarios[lugar._id] || ""}
                onChange={(e) => setRatingComentarios((prev) => ({ ...prev, [lugar._id]: e.target.value }))}
                style={{ width: "100%", marginTop: 8, padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: 6 }}
              />
              <br />
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-primary" onClick={() => setDetalleLugar(lugar)}>Ver detalles</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 🧭 Formulario lateral */}
      <div className="formulario-lugar">
        {/* Exploración estilo lista (claro) */}
        <div className="sidebar-light">
          <div className="sidebar-header">
            <div className="sidebar-title">Explorar lugares</div>
            <div className="sidebar-actions">
              <select className="select" value={filtros.minRating} onChange={(e) => setFiltros({ ...filtros, minRating: e.target.value })}>
                <option value={0}>Todos</option>
                {[1,2,3,4,5].map((n) => (
                  <option key={n} value={n}>{n}+ ⭐</option>
                ))}
              </select>
            </div>
          </div>
          <input className="input" type="text" placeholder="Buscar..." value={filtros.q} onChange={(e)=> setFiltros({ ...filtros, q: e.target.value })} />

          {/* Toolbar con menús desplegables */}
          <div className="toolbar">
            <div className="toolbar-group">
              <button type="button" className="menu-button" onClick={() => setMenuOpen(menuOpen === 'show' ? null : 'show')}>Mostrar ▾</button>
              {menuOpen === 'show' && (
                <div className="menu" onMouseLeave={() => setMenuOpen(null)}>
                  <button className="menu-item" onClick={() => { setFiltros({ ...filtros, certificado: '', minRating: 0 }); setMenuOpen(null); }}>Todos</button>
                  <button className="menu-item" onClick={() => { setFiltros({ ...filtros, certificado: 'APADEA' }); setMenuOpen(null); }}>Certificados APADEA</button>
                  <button className="menu-item" onClick={() => { setFiltros({ ...filtros, certificado: 'Comunidad' }); setMenuOpen(null); }}>Comunidad</button>
                  <button className="menu-item" onClick={() => { setFiltros({ ...filtros, minRating: 4 }); setMenuOpen(null); }}>Rating 4+ ⭐</button>
                </div>
              )}
            </div>
            <div className="toolbar-group">
              <button type="button" className="menu-button" onClick={() => setMenuOpen(menuOpen === 'sort' ? null : 'sort')}>Ordenar por ▾</button>
              {menuOpen === 'sort' && (
                <div className="menu" onMouseLeave={() => setMenuOpen(null)}>
                  <button className={`menu-item ${sortKey==='default'?'active':''}`} onClick={() => { setSortKey('default'); setMenuOpen(null); }}>Relevancia</button>
                  <button className={`menu-item ${sortKey==='name'?'active':''}`} onClick={() => { setSortKey('name'); setMenuOpen(null); }}>Nombre (A–Z)</button>
                  <button className={`menu-item ${sortKey==='rating'?'active':''}`} onClick={() => { setSortKey('rating'); setMenuOpen(null); }}>Rating (alto→bajo)</button>
                </div>
              )}
            </div>
            <div className="toolbar-group">
              <button type="button" className="menu-button" onClick={() => setMenuOpen(menuOpen === 'filters' ? null : 'filters')}>Filtros ▾</button>
              {menuOpen === 'filters' && (
                <div className="menu" onMouseLeave={() => setMenuOpen(null)}>
                  <div className="menu-row">
                    <label className="label">Tipo</label>
                    <select className="select" value={filtros.tipo} onChange={(e)=> setFiltros({ ...filtros, tipo: e.target.value })}>
                      <option value="">Todos</option>
                      {tipos.map((t)=> (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div className="menu-row">
                    <label className="label">Provincia</label>
                    <select className="select" value={filtros.provincia} onChange={(e)=> setFiltros({ ...filtros, provincia: e.target.value })}>
                      <option value="">Todas</option>
                      {provincias.map((p)=> (<option key={p} value={p}>{p}</option>))}
                    </select>
                  </div>
                  <div className="menu-row">
                    <label className="label">Inicial</label>
                    <select className="select" value={filtros.inicial} onChange={(e)=> setFiltros({ ...filtros, inicial: e.target.value })}>
                      <option value="">Todas</option>
                      {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch) => (
                        <option key={ch} value={ch}>{ch}</option>
                      ))}
                    </select>
                  </div>
                  <div className="menu-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => { setFiltros({ q:"", tipo:"", provincia:"", certificado:"", minRating:0, inicial:"" }); setMenuOpen(null); }}>Limpiar</button>
                    <button type="button" className="btn btn-primary" onClick={() => setMenuOpen(null)}>Aplicar</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="place-list">
            {listaOrdenada.slice(0, 12).map((l) => (
              <button key={l._id} type="button" className="place-item" onClick={() => {
                if (mapRef.current) {
                  mapRef.current.setView([l.latitud, l.longitud], Math.max(mapRef.current.getZoom?.()||13, 15), { animate: true });
                }
                if (markerRefs.current[l._id]?.openPopup) {
                  setTimeout(() => markerRefs.current[l._id].openPopup(), 200);
                }
              }}>
                <div className="place-meta">
                  <div className="place-title">{l.nombre}</div>
                  <div className="place-sub">{l.tipo || '—'} · {getCert(l)} · {Number(ratingPorLugar[l._id]?.avg||0).toFixed(1)}⭐</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        

        

        <div className="card">
          <div className="card-title">Agregar nuevo lugar</div>
          <p className="label">Hacé clic en el mapa para seleccionar la ubicación.</p>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {nuevoLugar.latitud && nuevoLugar.longitud ? (
              <span>Ubicación seleccionada ✓ (lat: {nuevoLugar.latitud.toFixed(5)}, lng: {nuevoLugar.longitud.toFixed(5)})</span>
            ) : (
              <span>Falta seleccionar ubicación en el mapa</span>
            )}
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <input
              className="input"
              type="text"
              placeholder="Nombre del lugar"
              value={nuevoLugar.nombre}
              onChange={(e) => setNuevoLugar({ ...nuevoLugar, nombre: e.target.value })}
              required
            />
            <input
              className="input"
              type="text"
              placeholder="Dirección"
              value={nuevoLugar.direccion}
              onChange={(e) => setNuevoLugar({ ...nuevoLugar, direccion: e.target.value })}
              required
            />
            <div className="filtros-row">
              <input
                className="input"
                type="text"
                placeholder="Tipo (ej: Shopping, Café...)"
                value={nuevoLugar.tipo}
                onChange={(e) => setNuevoLugar({ ...nuevoLugar, tipo: e.target.value })}
              />
              <input
                className="input"
                type="text"
                placeholder="Provincia"
                value={nuevoLugar.provincia}
                onChange={(e) => setNuevoLugar({ ...nuevoLugar, provincia: e.target.value })}
              />
            </div>
            <textarea
              className="input"
              placeholder="Descripción breve"
              value={nuevoLugar.descripcion}
              onChange={(e) => setNuevoLugar({ ...nuevoLugar, descripcion: e.target.value })}
            />
            <div>
              <label className="label">Etiquetas sensoriales</label>
              <div className="chips">
                {nuevoLugar.etiquetasSensoriales.map((tag, idx) => (
                  <span key={idx} className="chip">
                    {tag}
                    <button type="button" onClick={() => setNuevoLugar((prev) => ({
                      ...prev,
                      etiquetasSensoriales: prev.etiquetasSensoriales.filter((_, i) => i !== idx)
                    }))}>×</button>
                  </span>
                ))}
              </div>
              <input
                className="input"
                type="text"
                placeholder="Escribe y presioná Enter o coma"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val && !nuevoLugar.etiquetasSensoriales.includes(val)) {
                      setNuevoLugar((prev) => ({ ...prev, etiquetasSensoriales: [...prev.etiquetasSensoriales, val] }));
                    }
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={!nuevoLugar.nombre || !nuevoLugar.latitud || !nuevoLugar.longitud}>
              Agregar lugar
            </button>
          </form>

          {mensaje && (
            <p className={mensaje.includes("Error") ? "msg msg-error" : "msg msg-success"}>{mensaje}</p>
          )}
        </div>
      </div>

      {detalleLugar && (
        <div className="modal-backdrop" onClick={cerrarDetalle}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{detalleLugar.nombre}</div>
                <div style={{ color: '#64748b', fontSize: 14 }}>{detalleLugar.direccion}</div>
              </div>
              <button className="modal-close" onClick={cerrarDetalle}>×</button>
            </div>
            <div className="modal-body" style={{ gridTemplateColumns: '1fr' }}>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Certificación</div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, background: '#facc15', borderRadius: '50%' }}></span>
                      <span>Certificación oficial: {getCert(detalleLugar) === 'APADEA' ? 'APADEA' : '—'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, background: '#22c55e', borderRadius: '50%' }}></span>
                      <span>Validación comunitaria: {Number(ratingPorLugar[detalleLugar._id]?.avg || 0).toFixed(1)}/5 ({ratingPorLugar[detalleLugar._id]?.count || 0} usuarios)</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Detalles sensoriales</div>
                  {Array.isArray(detalleLugar.etiquetasSensoriales) && detalleLugar.etiquetasSensoriales.length ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {detalleLugar.etiquetasSensoriales.map((tag, i) => (
                        <span key={i} className="pin-tag">{tag}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#64748b' }}>Sin datos</div>
                  )}
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Opiniones de la comunidad</div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {resenas.filter((r) => (r.lugar?._id || r.lugar) === detalleLugar._id).slice(-3).reverse().map((r, idx) => (
                      <div key={idx} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, display: 'grid', gap: 8 }}>
                        {r.fotoUrl && (
                          <img src={r.fotoUrl} alt="foto reseña" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8 }} />
                        )}
                        <div style={{ color: '#1f2937' }}>{r.comentario || '(Sin comentario)'}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{typeof r.usuario === 'object' ? (r.usuario?.nombre || 'Usuario') : 'Usuario'}</div>
                      </div>
                    ))}
                    {!resenas.some((r) => (r.lugar?._id || r.lugar) === detalleLugar._id) && (
                      <div style={{ color: '#64748b' }}>(Aún no hay opiniones)</div>
                    )}
                  </div>
                </div>

                {/* Dejar reseña */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Dejar reseña</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {[1,2,3,4,5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className="btn"
                        style={{ background: n <= resenaForm.puntuacion ? 'var(--color-accent)' : 'var(--color-navbar-button)' }}
                        onClick={() => setResenaForm((p) => ({ ...p, puntuacion: n }))}
                      >
                        {n} ⭐
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Contá tu experiencia (opcional)"
                    value={resenaForm.comentario}
                    onChange={(e) => setResenaForm((p) => ({ ...p, comentario: e.target.value }))}
                    style={{ width: '100%', minHeight: 70, padding: 10, border: '1px solid #e5e7eb', borderRadius: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button
                      className="btn btn-primary"
                      onClick={enviarResenaModal}
                    >
                      Enviar reseña
                    </button>
                  </div>
                </div>

                {/* Subir foto */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 800 }}>Subir foto</div>
                    <button className="btn" onClick={() => setFotoUI((p) => ({ ...p, open: !p.open }))}>
                      {fotoUI.open ? 'Ocultar' : 'Seleccionar imagen'}
                    </button>
                  </div>
                  {fotoUI.open && (
                    <div style={{ display: 'grid', gap: 10 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = URL.createObjectURL(file);
                          setFotoUI({ open: true, file, preview: url });
                        }}
                      />
                      {fotoUI.preview && (
                        <img src={fotoUI.preview} alt="preview" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 12 }} />
                      )}
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Nota: vista previa local. Para guardar en el servidor necesitamos un endpoint de carga.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
