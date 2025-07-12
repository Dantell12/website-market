import { Request, Response, RequestHandler, NextFunction } from "express";
import { Usuario, ICliente } from "../models/users.model";

// GET /api/clients
export const getClients: RequestHandler = async (req, res) => {
  try {
    const clients = await Usuario.find(
      { rol: "cliente" },
      "email cliente"
    ).lean();

    if (clients.length === 0) {
      res.status(404).json({ msg: "No hay clientes registrados" });
      return;
    }

    res.json(clients);
  } catch (err) {
    console.error("Error getClients:", err);
    res.status(500).json({ msg: "Error interno al obtener clientes" });
  }
};

// GET /api/clients/:id
export const getClientById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Usuario.findById(id, "email cliente").lean();

    if (!user || user.rol !== "cliente") {
      res.status(404).json({ msg: "Cliente no encontrado" });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error("Error getClientById:", err);
    res.status(500).json({ msg: "Error interno al obtener cliente" });
  }
};

// POST /api/clients

export const postClient = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { email, password, cliente } = req.body;

    if (!email || !password || !cliente || !cliente.nombre || !cliente.apellido || !cliente.cedula) {
      res.status(400).json({ msg: "Faltan datos requeridos" });
      return;
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      res.status(409).json({ msg: "Ya existe un usuario con ese correo" });
      return;
    }

    const nuevoUsuario = new Usuario({
      email,
      password,
      rol: "cliente",
      cliente,
    });

    await nuevoUsuario.save();

    res.status(201).json({ msg: "Cliente creado correctamente", usuario: nuevoUsuario });
  } catch (err) {
    console.error("Error postClient:", err);
    res.status(500).json({ msg: "Error interno al crear cliente" });
  }
};

// PUT /api/clients/:id
export const updateClient: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const updateData: Partial<ICliente> = req.body;

  try {
    const usuario = await Usuario.findById(id);

    if (!usuario || usuario.rol !== "cliente") {
      res.status(404).json({ msg: "Cliente no encontrado" });
      return;
    }

    usuario.cliente = {
      ...usuario.cliente!,
      ...updateData,
    };
    await usuario.save();

    res.json({ msg: "Cliente actualizado", cliente: usuario.cliente });
  } catch (err) {
    console.error("Error updateClient:", err);
    res.status(500).json({ msg: "Error interno al actualizar cliente" });
  }
};

// DELETE /api/clients/:id
export const deleteClient: RequestHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findById(id);

    if (!usuario || usuario.rol !== "cliente") {
      res.status(404).json({ msg: "Cliente no encontrado" });
      return;
    }

    usuario.cliente = undefined;
    await usuario.save();

    res.json({ msg: "Cliente eliminado" });
  } catch (err) {
    console.error("Error deleteClient:", err);
    res.status(500).json({ msg: "Error interno al eliminar cliente" });
  }
};
