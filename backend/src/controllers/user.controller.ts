import { Request, Response } from "express";
import { UsuarioModel } from "../models/users.model"; // Asegúrate de que este modelo esté bien exportado
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ClienteModel } from "../models/clients.model";
import { RequestHandler } from "express";

const SECRET_KEY = "IkN5IPS8KhXGa&-RnR}eX)RS~Cy}8R";
/**
 * Método loginUser
 * Este método permite iniciar sesión a un usuario existente
 */
export const loginUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario por email
    const user: any = await UsuarioModel.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({
        msg: `No existe un usuario con el email ${email}`,
      });
      return;
    }

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        msg: "Contraseña incorrecta",
      });
      return;
    }
    const client: any = await ClienteModel.findOne({
      where: { id_usuario: user.id_usuario },
    });

    if (!client) {
      res.status(404).json({
        msg: `No existe un cliente con el id_usuario} ${user.id_usuario}`,
      });
      return;
    }
    // Generar token
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        email: user.email,
        rol: user.rol,
      },
      SECRET_KEY || "default_secret",
      { expiresIn: "2h" }
    );

    res.json({
      msg: "Inicio de sesión exitoso",
      token,
      user: {
        id_usuario: user.id_usuario,
        email: user.email,
        rol: user.rol,
        id_cliente: client.id_cliente,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({
      msg: "Error al iniciar sesión",
    });
  }
};

// REGISTRO DE USUARIO
export const newUser: RequestHandler = async (req, res) => {
  const { email, password, nombre, apellido, cedula, direccion } = req.body;

  try {
    // Validar si el email ya existe
    const userExist = await UsuarioModel.findOne({ where: { email } });
    if (userExist) {
      res.status(400).json({ msg: "El correo electrónico ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const createdUser = await UsuarioModel.create({
      email,
      password: hashedPassword,
      rol: "cliente",
    });

    // Verificar si la cédula ya existe
    const existingClient = await ClienteModel.findOne({ where: { cedula } });

    if (!existingClient) {
      // Crear cliente con id_usuario
      await ClienteModel.create({
        nombre,
        apellido,
        cedula,
        direccion,
        id_usuario: createdUser.get("id_usuario"),
      });
    }

    res.status(201).json({
      msg: "Usuario registrado correctamente",
      userId: createdUser.get("id_usuario"),
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ msg: "Error al registrar usuario", error });
  }
};
