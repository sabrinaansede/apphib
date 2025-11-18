import express from "express";
import {
  obtenerLugares,
  crearLugar,
  votarLugar
} from "../controllers/lugar.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", obtenerLugares);
router.post("/", crearLugar);
router.put("/:id/votar", authMiddleware, votarLugar);

export default router;
