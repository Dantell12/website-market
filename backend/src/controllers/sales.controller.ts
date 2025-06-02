// src/controllers/sales.controller.ts

import { Request, Response, RequestHandler } from "express";
import { CarritoModel } from "../models/carts.model";
import { CarritoProductoModel } from "../models/product_carts.model";
import sequelize from "../config/conection";
import { VentaModel } from "../models/sales.model";
import { DetalleVentaModel } from "../models/detail_sales.model";
import { ProductoModel } from "../models/products.model";
import { ClienteModel } from "../models/clients.model";
import { Op } from "sequelize";

export const confirmSale: RequestHandler = async (req, res) => {
  const clienteId = parseInt(req.params.id_cliente, 10);
  if (isNaN(clienteId)) {
    res.status(400).json({ msg: "ID de cliente inválido" });
    return;
  }

  const t = await sequelize.transaction();
  try {
    //  Buscar carrito activo
    const carrito = await CarritoModel.findOne({
      where: { id_cliente: clienteId, estado: "activo" },
      transaction: t,
    });
    if (!carrito) {
      await t.rollback();
      res.status(404).json({ msg: "No hay carrito activo para este cliente" });
      return;
    }
    const idCarrito = carrito.get("id_carrito") as number;

    // 2️⃣ Obtener ítems del carrito
    const items = await CarritoProductoModel.findAll({
      where: { id_carrito: idCarrito },
      transaction: t,
    });
    if (items.length === 0) {
      await t.rollback();
      res.status(400).json({ msg: "El carrito está vacío" });
      return;
    }

    // 3️⃣ Verificar y reducir stock de cada producto
    for (const item of items) {
      const prodId = item.get("id_producto") as number;
      const qty = item.get("cantidad") as number;

      // Lock FOR UPDATE para evitar race conditions
      const producto = await ProductoModel.findByPk(prodId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!producto) {
        await t.rollback();
        res.status(404).json({ msg: `Producto ${prodId} no encontrado` });
        return;
      }

      const stock = producto.get("stock") as number;
      if (stock < qty) {
        await t.rollback();
        res
          .status(400)
          .json({ msg: `Stock insuficiente para el producto ${prodId}` });
        return;
      }

      // Reducir stock
      await producto.update({ stock: stock - qty }, { transaction: t });
    }

    //  Calcular totales
    let subtotal = 0,
      impuestos = 0,
      total = 0;
    items.forEach((item) => {
      const qty = item.get("cantidad") as number;
      const unitTax = parseFloat(item.get("impuesto") as any);
      const lineSubtotal = parseFloat(item.get("subtotal") as any);
      const linePrice = parseFloat(item.get("precio_unitario") as any) * qty;
      subtotal += linePrice;
      impuestos += unitTax * qty;
      total += lineSubtotal;
    });

    // 5️⃣ Crear cabecera de venta
    const venta = await VentaModel.create(
      {
        id_cliente: clienteId,
        id_carrito: idCarrito,
        subtotal,
        impuestos,
        total,
      },
      { transaction: t }
    );
    const idVenta = venta.get("id_venta") as number;

    // 6️⃣ Crear detalle_ventas
    for (const item of items) {
      await DetalleVentaModel.create(
        {
          id_venta: idVenta,
          id_producto: item.get("id_producto"),
          cantidad: item.get("cantidad"),
          precio_unitario: item.get("precio_unitario"),
          impuesto: item.get("impuesto"),
          subtotal: item.get("subtotal"),
        },
        { transaction: t }
      );
    }

    //  Marcar carrito como confirmado
    await carrito.update({ estado: "confirmado" }, { transaction: t });

    await t.commit();
    res.json({ msg: "Venta realizada con éxito", id_venta: idVenta });
    return;
  } catch (error) {
    console.error("Error al confirmar venta:", error);
    await t.rollback();
    res.status(500).json({ msg: "Error al procesar la venta" });
    return;
  }
};

export const getSalesByClient: RequestHandler = async (req, res) => {
  const clienteId = parseInt(req.params.id_cliente, 10);
  if (isNaN(clienteId)) {
    res.status(400).json({ msg: "ID de cliente inválido" });
    return;
  }

  try {
    // Buscar datos del cliente
    const cliente = await ClienteModel.findByPk(clienteId);

    if (!cliente) {
      res.status(404).json({ msg: "Cliente no encontrado" });
      return;
    }

    // Obtener todas las ventas del cliente
    const ventas = await VentaModel.findAll({
      where: { id_cliente: clienteId },
      order: [["fecha", "DESC"]],
    });

    // Por cada venta, obtener sus detalles
    const result = await Promise.all(
      ventas.map(async (venta) => {
        const idVenta = venta.get("id_venta") as number;

        // Detalles de la venta
        const detalles = await DetalleVentaModel.findAll({
          where: { id_venta: idVenta },
        });

        const idsProductos = detalles.map(
          (d) => d.get("id_producto") as number
        );

        const productos = await ProductoModel.findAll({
          where: { id_producto: idsProductos },
        });

        const lineas = detalles.map((d) => {
          const prod = productos.find(
            (p) => p.get("id_producto") === d.get("id_producto")
          );
          return {
            cantidad: d.get("cantidad"),
            precio_unitario: d.get("precio_unitario"),
            impuesto: d.get("impuesto"),
            subtotal: d.get("subtotal"),
            producto: prod ? prod.toJSON() : null,
          };
        });

        return {
          id_venta: idVenta,
          fecha: venta.get("fecha"),
          subtotal: venta.get("subtotal"),
          impuestos: venta.get("impuestos"),
          total: venta.get("total"),
          detalles: lineas,
        };
      })
    );

    // Enviar ventas y datos del cliente
    res.json({
      cliente: {
        id_cliente: cliente.get("id_cliente"),
        nombre: cliente.get("nombre"),
        apellido: cliente.get("apellido"),
        cedula: cliente.get("cedula"),
        direccion: cliente.get("direccion"),
      },
      ventas: result,
    });
  } catch (error) {
    console.error("Error al obtener ventas del cliente:", error);
    res.status(500).json({ msg: "Error al obtener las ventas del cliente" });
    return;
  }
};
/**
 * Controlador para que el ADMIN obtenga todas las ventas
 * con cliente y detalles de cada venta.
 */export const getAllSalesAdmin: RequestHandler = async (req, res) => {
  try {
    // 1) Traer todas las ventas ordenadas por fecha descendente
    const ventas = await VentaModel.findAll({
      order: [["fecha", "DESC"]],
    });

    // 2) Para cada venta, obtener su detalle, los datos de producto y el cliente manualmente
    const result = await Promise.all(
      ventas.map(async (venta) => {
        const idVenta = venta.get("id_venta") as number;
        const idCliente = venta.get("id_cliente") as number;

        // Obtener datos del cliente
        const cliente = await ClienteModel.findByPk(idCliente, {
          attributes: ["id_cliente", "nombre", "apellido", "cedula", "direccion"],
        });

        // Obtener todos los detalles de esta venta
        const detalles = await DetalleVentaModel.findAll({
          where: { id_venta: idVenta },
        });

        // Lista de IDs de producto para esta venta
        const idsProductos = detalles.map((d) => d.get("id_producto") as number);

        // Traer info de cada producto
        const productos = await ProductoModel.findAll({
          where: { id_producto: { [Op.in]: idsProductos } },
        });

        // Construir el array de líneas
        const lineas = detalles.map((d) => {
          const prod = productos.find((p) => p.get("id_producto") === d.get("id_producto"));
          return {
            cantidad: d.get("cantidad"),
            precio_unitario: d.get("precio_unitario"),
            impuesto: d.get("impuesto"),
            subtotal: d.get("subtotal"),
            producto: prod ? prod.toJSON() : null,
          };
        });

        return {
          id_venta: idVenta,
          fecha: venta.get("fecha"),
          subtotal: venta.get("subtotal"),
          impuestos: venta.get("impuestos"),
          total: venta.get("total"),
          cliente: cliente ? cliente.toJSON() : null,
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