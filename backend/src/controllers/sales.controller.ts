import { RequestHandler } from "express";
import { Carrito } from "../models/carts.model";
import { Producto } from "../models/products.model";
import { Venta } from "../models/sales.model";
import { Usuario } from "../models/users.model";
import { Types } from "mongoose";
import { Int32 }     from "mongodb";

/**
 * Confirmar venta de un carrito
 * Recibe el id_cliente como string (MongoDB _id)
 */
// src/controllers/sales.controller.ts

export const confirmSale: RequestHandler = async (req, res) => {
  const id_cliente = req.params.id_cliente;
  if (!id_cliente || !Types.ObjectId.isValid(id_cliente)) {
    res.status(400).json({ msg: "ID de cliente inválido" });
    return;
  }
  const clienteId = new Types.ObjectId(id_cliente);

  // Buscar carrito activo
  const carrito = await Carrito.findOne({ id_cliente: clienteId, estado: "activo" });
  if (!carrito) {
    res.status(404).json({ msg: "No hay carrito activo para este cliente" });
    return;
  }
  if (!carrito.productos.length) {
    res.status(400).json({ msg: "El carrito está vacío" });
    return;
  }

  // Reducir stock
  for (const item of carrito.productos) {
    const prod = await Producto.findById(item.id_producto);
    if (!prod) {
      res.status(404).json({ msg: `Producto ${item.id_producto} no encontrado` });
      return;
    }
    if (typeof prod.stock !== "number") {
      res.status(500).json({ msg: `Stock inválido en ${prod.nombre}` });
      return;
    }
    prod.stock -= item.cantidad;
    await prod.save();
  }

  // Construir detalle y totales
  let subtotal = 0, impuestos = 0, total = 0;
  const detalle = carrito.productos.map(item => {
    const cantidadNum = Number(item.cantidad);
    const precioUnit  = Number(item.precio_unitario);
    const imp         = Number(item.impuesto || 0);
    const lineSub     = precioUnit * cantidadNum;
    subtotal += lineSub;
    impuestos += imp;
    total     += lineSub + imp;
    return {
      id_producto:     new Types.ObjectId(item.id_producto),
      cantidad:        new Int32(cantidadNum),
      precio_unitario: precioUnit,
      impuesto:        imp,
      subtotal:        lineSub
    };
  });

  const ventaData = {
    id_cliente: clienteId,
    id_carrito: carrito._id,
    fecha:      new Date(),
    subtotal,
    impuestos,
    total,
    detalle
  };

  try {
    // ¡Usamos bypassDocumentValidation para saltar el validador JSON-Schema!
    const result = await Venta.collection.insertOne(ventaData, {
      bypassDocumentValidation: true
    });

    // Marcar carrito completado
    await Carrito.updateOne({ _id: carrito._id }, { $set: { estado: "completado" } });

    res.json({ msg: "Venta realizada con éxito", id_venta: result.insertedId });
  } catch (err: any) {
    console.error("Error al confirmar venta:", err);
    res.status(500).json({ msg: "Error al procesar la venta" });
  }
};

/**
 * Obtener ventas de un cliente
 * Recibe id_cliente como parámetro (MongoDB _id)
 */
export const getSalesByClient: RequestHandler = async (req, res) => {
  const id_cliente = req.params.id_cliente;
  if (!id_cliente || !Types.ObjectId.isValid(id_cliente)) {
    res.status(400).json({ msg: "ID de cliente inválido" });
    return;
  }
  const clienteId = new Types.ObjectId(id_cliente);

  try {
    // Buscar usuario
    const usuario = await Usuario.findById(clienteId);

    if (!usuario || usuario.rol !== "cliente" || !usuario.cliente) {
      res.status(404).json({ msg: "Cliente no encontrado" });
      return;
    }

    // Obtener todas las ventas del usuario
    const ventas = await Venta.find({ id_cliente: clienteId }).sort({ fecha: -1 });

    // Por cada venta, obtener sus detalles (productos)
    const result = await Promise.all(
      ventas.map(async (venta) => {
        const lineas = await Promise.all(
          (venta.detalle ?? []).map(async (d: any) => {
            const prod = await Producto.findById(d.id_producto);
            return {
              cantidad: d.cantidad,
              precio_unitario: d.precio_unitario,
              impuesto: d.impuesto,
              subtotal: d.subtotal,
              producto: prod ? prod.toJSON() : null,
            };
          })
        );

        return {
          id_venta: venta._id,
          fecha: venta.fecha,
          subtotal: venta.subtotal,
          impuestos: venta.impuestos,
          total: venta.total,
          detalles: lineas,
        };
      })
    );

    // Enviar ventas y datos del cliente
    res.json({
      cliente: usuario.cliente,
      ventas: result,
    });
  } catch (error) {
    console.error("Error al obtener ventas del cliente:", error);
    res.status(500).json({ msg: "Error al obtener las ventas del cliente" });
  }
};

/**
 * Controlador para que el ADMIN obtenga todas las ventas
 * con cliente y detalles de cada venta.
 */
export const getAllSalesAdmin: RequestHandler = async (req, res) => {
  try {
    // Traer todas las ventas ordenadas por fecha descendente
    const ventas = await Venta.find().sort({ fecha: -1 });

    // Para cada venta, obtener su detalle, los datos de producto y el cliente manualmente
    const result = await Promise.all(
      ventas.map(async (venta) => {
        const usuario = await Usuario.findById(venta.id_cliente);

        const lineas = await Promise.all(
          (venta.detalle ?? []).map(async (d: any) => {
            const prod = await Producto.findById(d.id_producto);
            return {
              cantidad: d.cantidad,
              precio_unitario: d.precio_unitario,
              impuesto: d.impuesto,
              subtotal: d.subtotal,
              producto: prod ? prod.toJSON() : null,
            };
          })
        );

        return {
          id_venta: venta._id,
          fecha: venta.fecha,
          subtotal: venta.subtotal,
          impuestos: venta.impuestos,
          total: venta.total,
          cliente: usuario && usuario.cliente ? usuario.cliente : null,
          detalles: lineas,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Error al obtener todas las ventas (Admin):", error);
    res.status(500).json({ msg: "Error al obtener todas las ventas" });
  }
};