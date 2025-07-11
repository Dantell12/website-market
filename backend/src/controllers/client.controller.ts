import { Request, Response, RequestHandler } from "express";
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
