import express from "express";
import Usuario from "../models/usuario.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// POST /usuarios/register
router.post("/register", async (req, res) => {
  const { nombre, email, password, telefono, tipoUsuario } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email y password son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      tipoUsuario,
    });
    await nuevoUsuario.save();

    const { _id, nombre: nombreGuardado, telefono: telGuardado, tipoUsuario: tipoGuardado } = nuevoUsuario;
    const payload = { id: _id.toString(), email, tipoUsuario: tipoGuardado };
    const secret = process.env.JWT_SECRET || "dev_secret_autisi";
    const token = jwt.sign(payload, secret, { expiresIn: "8h" });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        _id,
        nombre: nombreGuardado,
        email,
        telefono: telGuardado,
        tipoUsuario: tipoGuardado,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// POST /usuarios/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email y password son obligatorios" });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }
    const { _id, nombre, telefono, tipoUsuario } = usuario;
    const payload = { id: _id.toString(), email, tipoUsuario };
    const secret = process.env.JWT_SECRET || "dev_secret_autisi";
    const token = jwt.sign(payload, secret, { expiresIn: "8h" });

    res.json({
      message: "Login exitoso",
      user: { _id, nombre, email, telefono, tipoUsuario },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

export default router;
