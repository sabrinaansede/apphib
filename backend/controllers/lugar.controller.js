import Lugar from "../models/lugar.model.js";

export const obtenerLugares = async (req, res) => {
  try {
    const lugares = await Lugar.find();
    res.json(lugares);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los lugares" });
  }
};

export const crearLugar = async (req, res) => {
  try {
    const {
      nombre,
      direccion,
      latitud,
      longitud,
      tipo = "",
      provincia = "",
      descripcion = "",
      etiquetasSensoriales = [],
      certificacion = "Comunidad",
    } = req.body || {};

    // Validaciones básicas
    const faltantes = [];
    if (!nombre) faltantes.push("nombre");
    if (!direccion) faltantes.push("direccion");
    if (latitud === undefined || longitud === undefined) faltantes.push("coordenadas");
    if (faltantes.length) {
      return res.status(400).json({ error: `Faltan campos obligatorios: ${faltantes.join(", ")}` });
    }

    const nuevoLugar = new Lugar({
      nombre,
      direccion,
      latitud,
      longitud,
      tipo,
      provincia,
      descripcion,
      etiquetasSensoriales,
      certificacion,
    });

    await nuevoLugar.save();
    res.status(201).json(nuevoLugar);
  } catch (error) {
    console.error("Error al crear el lugar:", error?.message || error);
    res.status(500).json({ error: error?.message || "Error al crear el lugar" });
  }
};

export const votarLugar = async (req, res) => {
  try {
    const lugar = await Lugar.findById(req.params.id);
    if (!lugar) return res.status(404).json({ error: "Lugar no encontrado" });
    lugar.votos = (lugar.votos || 0) + 1;
    await lugar.save();
    res.json(lugar);
  } catch (error) {
    res.status(500).json({ error: "Error al votar el lugar" });
  }
};
