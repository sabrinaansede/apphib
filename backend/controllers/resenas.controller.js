import Reseña from "../models/resenas.model.js";

// Crear reseña (admite imagen opcional en campo 'foto')
const crearReseña = async (req, res) => {
  try {
    const { lugar, usuario, puntuacion, comentario } = req.body || {};
    if (!lugar || !usuario || (puntuacion === undefined)) {
      return res.status(400).json({ error: "Faltan campos obligatorios (lugar, usuario, puntuacion)" });
    }
    const data = {
      lugar,
      usuario,
      puntuacion: Number(puntuacion),
      comentario: comentario || "",
    };
    if (req.file) {
      data.fotoUrl = `/uploads/${req.file.filename}`;
    }
    const nuevaReseña = new Reseña(data);
    await nuevaReseña.save();
    res.status(201).json({ message: "Reseña creada", data: nuevaReseña });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar todas las reseñas
const listarReseñas = async (req, res) => {
  try {
    const reseñas = await Reseña.find()
      .populate("usuario", "nombre email")
      .populate("lugar", "nombre direccion");
    res.json({ data: reseñas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener reseña por ID
const obtenerReseña = async (req, res) => {
  try {
    const reseña = await Reseña.findById(req.params.id)
      .populate("usuario", "nombre email")
      .populate("lugar", "nombre direccion");
    if (!reseña) return res.status(404).json({ message: "Reseña no encontrada" });
    res.json({ data: reseña });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar reseña
const actualizarReseña = async (req, res) => {
  try {
    const reseña = await Reseña.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reseña) return res.status(404).json({ message: "Reseña no encontrada" });
    res.json({ message: "Reseña actualizada", data: reseña });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar reseña
const eliminarReseña = async (req, res) => {
  try {
    const reseña = await Reseña.findByIdAndDelete(req.params.id);
    if (!reseña) return res.status(404).json({ message: "Reseña no encontrada" });
    res.json({ message: "Reseña eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { crearReseña, listarReseñas, obtenerReseña, actualizarReseña, eliminarReseña };
