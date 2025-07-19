import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario, ICliente } from "../models/users.model";

const SECRET_KEY = process.env.SECRET_KEY || "pepito123"

// POST /api/users/register
export const registerUser: RequestHandler = async (req, res) => {
  const { email, password, nombre, apellido, cedula, direccion } = req.body;

  try {
    // 1) Validar email único
    if (await Usuario.findOne({ email })) {
      res.status(400).json({ msg: "El correo ya está registrado" });
      return;
    }

    // 2) Crear usuario
    const hashed = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
      email,
      password: hashed,
      rol: "cliente",
    });

    // 3) Crear subdocumento cliente
    const clienteData: ICliente = { nombre, apellido, cedula, direccion };
    usuario.cliente = clienteData;
    await usuario.save();

    res.status(201).json({ msg: "Usuario registrado", userId: usuario.id });
  } catch (err) {
    console.error("Error registerUser:", err);
    res.status(500).json({ msg: "Error interno al registrar usuario" });
  }
};

// POST /api/users/login
export const loginUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      res.status(404).json({ msg: "Usuario no encontrado" });
      return;
    }

    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) {
      res.status(401).json({ msg: "Contraseña incorrecta" });
      return;
    }

    const token = jwt.sign(
      { _id: usuario.id, email: usuario.email, rol: usuario.rol },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.json({
      msg: "Login exitoso",
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        cliente: usuario.cliente || null,
      },
    });
  } catch (err) {
    console.error("Error loginUser:", err);
    res.status(500).json({ msg: "Error interno al iniciar sesión" });
  }
};
