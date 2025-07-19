import { Request, Response, RequestHandler } from "express";
import { Venta } from "../models/sales.model";
import { Usuario } from "../models/users.model";
import { Producto } from "../models/products.model";
import { Carrito } from "../models/carts.model";

// 1) Obtener todas las ventas (lista básica)
export const getAllSales: RequestHandler = async (_req, res) => {
  try {
    const ventas = await Venta.find()
      .sort({ fecha: -1 })
      .populate({
        path: "id_cliente",
        select: "nombre apellido cedula",
        model: Usuario,
      })
      .populate({
        path: "detalle.id_producto",
        select: "nombre categoria temporada",
        model: Producto,
      })
      .lean();
    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener todas las ventas:", error);
    res.status(500).json({ msg: "Error al obtener todas las ventas" });
  }
};
export const getTotalRevenue: RequestHandler = async (_req, res) => {
  try {
    const result = await Venta.aggregate([
      { $group: { _id: null, totalVendido: { $sum: "$total" } } }
    ]);
    const totalVendido = result[0]?.totalVendido || 0;
    res.json({ totalVendido });
  } catch (error) {
    console.error("Error al calcular total vendido:", error);
    res.status(500).json({ msg: "Error al calcular total vendido" });
  }
};
export const getIncomeBySeason: RequestHandler = async (_req, res) => {
  try {
    // Unwind para detalle, lookup para producto, group por temporada
    const result = await Venta.aggregate([
      { $unwind: "$detalle" },
      {
        $lookup: {
          from: "productos",
          localField: "detalle.id_producto",
          foreignField: "_id",
          as: "producto"
        }
      },
      { $unwind: "$producto" },
      {
        $group: {
          _id: "$producto.temporada",
          ingresoTotal: { $sum: "$detalle.subtotal" }
        }
      },
      {
        $project: {
          temporada: "$_id",
          ingresoTotal: 1,
          _id: 0
        }
      }
    ]);
    res.json(result);
  } catch (error) {
    console.error("Error al generar reporte de ingresos por temporada:", error);
    res.status(500).json({ msg: "Error al generar reporte de ingresos por temporada" });
  }
};
export const getProductReport: RequestHandler = async (_req, res) => {
  try {
    const productos = await Producto.find().lean();
    const reporte = productos.map((p) => {
      const stock = p.stock;
      const temporada = p.temporada;
      let estado: string;
      if (stock === 0) estado = "agotado";
      else if (stock <= 5) estado = "mínimo";
      else estado = "disponible";

      let descuentoRate = 0;
      if (temporada === "media") descuentoRate = 0.25;
      else if (temporada === "baja") descuentoRate = 0.35;

      const precioBase = p.precio;
      const precioConDescuento = +(precioBase * (1 - descuentoRate)).toFixed(2);
      const tieneAlerta = stock <= 5;

      return {
        _id: p._id,
        nombre: p.nombre,
        categoria: p.categoria,
        temporada,
        precio: precioBase,
        descuentoRate,
        precio_con_descuento: precioConDescuento,
        stock,
        estado,
        alerta: tieneAlerta,
      };
    });
    res.json(reporte);
  } catch (error) {
    console.error("Error al generar reporte de productos:", error);
    res.status(500).json({ msg: "Error al generar reporte de productos" });
  }
};
export const getFrequentCustomers: RequestHandler = async (req, res) => {
  try {
    const minCompras = parseInt(req.query.minCompras as string) || 1;
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    const result = await Venta.aggregate([
      { $match: { fecha: { $gte: haceUnMes } } },
      { $group: { _id: "$id_cliente", cantidadVentas: { $sum: 1 } } },
      { $match: { cantidadVentas: { $gt: minCompras } } }
    ]);

    // Traer datos del cliente
    const clientes = await Promise.all(
      result.map(async (fila) => {
        const usuario = await Usuario.findById(fila._id).lean();
        // Soporta tanto usuario.cliente como root
        const cliente = usuario?.cliente
          ? {
              nombre: usuario.cliente.nombre,
              apellido: usuario.cliente.apellido,
              cedula: usuario.cliente.cedula,
              direccion: usuario.cliente.direccion,
            }
          : null;
        return {
          cliente,
          cantidadVentas: fila.cantidadVentas,
        };
      })
    );

    res.json(clientes);
  } catch (error) {
    console.error("Error al generar reporte de clientes frecuentes:", error);
    res.status(500).json({ msg: "Error al generar reporte de clientes frecuentes" });
  }
};
export const getUnsoldProducts: RequestHandler = async (_req, res) => {
  try {
    // Traer todos los id_producto vendidos
    const vendidos = await Venta.aggregate([
      { $unwind: "$detalle" },
      { $group: { _id: "$detalle.id_producto" } }
    ]);
    const idsVendidos = vendidos.map((v) => v._id);

    // Productos cuyo _id NO esté en idsVendidos
    const noVendidos = await Producto.find({ _id: { $nin: idsVendidos } })
      .select("nombre categoria stock temporada")
      .lean();

    res.json(noVendidos);
  } catch (error) {
    console.error("Error al generar reporte de productos no vendidos:", error);
    res.status(500).json({ msg: "Error al generar reporte de productos no vendidos" });
  }
};
export const getAbandonedCarts: RequestHandler = async (_req, res) => {
  try {
    // Carritos activos con productos y sin venta asociada
    const carritos = await Carrito.find({ estado: "activo", "productos.0": { $exists: true } }).lean();

    const result = [];
    for (const carrito of carritos) {
      // ¿Existe una venta asociada a este carrito?
      const ventaAsociada = await Venta.findOne({ id_carrito: carrito._id });
      if (ventaAsociada) continue;

      // Datos del cliente
      const usuario = await Usuario.findById(carrito.id_cliente).lean();
      const cliente = usuario?.cliente
        ? {
            nombre: usuario.cliente.nombre,
            apellido: usuario.cliente.apellido,
            cedula: usuario.cliente.cedula,
            direccion: usuario.cliente.direccion,
          }
        : null;
      result.push({
        id_carrito: carrito._id?.toString(),
        numero: carrito.numero, // <-- agrega esto si existe el campo
        cliente,
        fecha: carrito.fecha,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error al generar reporte de carritos abandonados:", error);
    res.status(500).json({ msg: "Error al generar reporte de carritos abandonados" });
  }
};