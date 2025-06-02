// src/controllers/clients.controller.ts

import { Request, RequestHandler, Response } from "express";
import { ClienteModel } from "../models/clients.model";

/**
 * Metodo getClient
 * Devuelve lista de todos los clientes
 */
export const getClient: RequestHandler = async (req: Request, res: Response) => {
  try {
    const listClients = await ClienteModel.findAll();
    if (listClients.length > 0) {
       res.json(listClients);
    } else {
       res.status(404).json({
        msg: "No se ha encontrado ningún cliente",
      });
    }
  } catch (error) {
    console.error("Error al obtener lista de clientes:", error);
     res.status(500).json({
      msg: "Error al obtener lista de clientes",
    });
  }
};

/**
 * Metodo getClientById
 * Devuelve un cliente por su ID
 */
export const getClientById: RequestHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const client = await ClienteModel.findByPk(id);
    if (client) {
       res.json(client);
    } else {
       res.status(404).json({
        msg: `No existe un cliente con el id: ${id}`,
      });
    }
  } catch (error) {
    console.error(`Error al obtener cliente ${id}:`, error);
     res.status(500).json({
      msg: "Error al obtener el cliente",
    });
  }
};

/**
 * Metodo postClient
 * Crea un nuevo cliente
 */
export const postClient: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, cedula, direccion, id_usuario } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !cedula) {
       res.status(400).json({
        msg: "Faltan datos obligatorios: nombre, apellido o cédula",
      });
    }

    // Verificar unicidad de cédula
    const exists = await ClienteModel.findOne({ where: { cedula } });
    if (exists) {
       res.status(400).json({
        msg: `La cédula ${cedula} ya está registrada`,
      });
    }

    const newClient = await ClienteModel.create({
      nombre,
      apellido,
      cedula,
      direccion: direccion ?? null,
      id_usuario: id_usuario ?? null,
    });

     res.status(201).json({
      msg: "Cliente creado correctamente",
      client: newClient,
    });
  } catch (error) {
    console.error("Error al registrar cliente:", error);
     res.status(500).json({
      msg: "Error al registrar cliente",
    });
  }
};

/**
 * Metodo updateClient
 * Actualiza un cliente existente
 */
export const updateClient: RequestHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, apellido, cedula, direccion, id_usuario } = req.body;

  try {
    const client = await ClienteModel.findByPk(id);
    if (!client) {
       res.status(404).json({
        msg: `No existe un cliente con id: ${id}`,
      });
      return;
    }

    // Si la cédula cambia, verificar que no choque con otra
    if (cedula && cedula !== client.get("cedula")) {
      const cedulaExists = await ClienteModel.findOne({ where: { cedula } });
      if (cedulaExists) {
         res.status(400).json({
          msg: `La cédula ${cedula} ya está registrada en otro cliente`,
        });
        return;
      }
    }

    await client.update({
      nombre: nombre  ?? client.get("nombre"),
      apellido: apellido ?? client.get("apellido"),
      cedula: cedula ?? client.get("cedula"),
      direccion: direccion !== undefined ? direccion : client.get("direccion"),
      id_usuario: id_usuario !== undefined ? id_usuario : client.get("id_usuario"),
    });

     res.json({
      msg: "Cliente actualizado correctamente",
      client,
    });
  } catch (error) {
    console.error(`Error al actualizar cliente ${id}:`, error);
     res.status(500).json({
      msg: "Error al actualizar cliente",
    });
  }
};

/**
 * Metodo deleteClient
 * Elimina físicamente un cliente
 */
export const deleteClient: RequestHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedCount = await ClienteModel.destroy({ where: { id_cliente: id } });
    if (deletedCount === 0) {
       res.status(404).json({
        msg: `No existe un cliente con id: ${id}`,
      });
    }
     res.json({
      msg: "Cliente eliminado correctamente",
    });
  } catch (error) {
    console.error(`Error al eliminar cliente ${id}:`, error);
     res.status(500).json({
      msg: "Error al eliminar cliente",
    });
  }
};
