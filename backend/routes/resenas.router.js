import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../middlewares/auth.middleware.js";
import { crearReseña, listarReseñas, obtenerReseña, actualizarReseña, eliminarReseña } from "../controllers/resenas.controller.js";

const router = express.Router();

// Asegurar carpeta de uploads
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Configuración de multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = path.basename(file.originalname || "foto", ext).replace(/[^a-z0-9-_]/gi, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const upload = multer({ storage });

router.post("/", authMiddleware, upload.single("foto"), crearReseña);
router.get("/", listarReseñas);
router.get("/:id", obtenerReseña);
router.put("/:id", authMiddleware, actualizarReseña);
router.delete("/:id", authMiddleware, eliminarReseña);

export default router;
