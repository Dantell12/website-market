// src/controllers/reportes.controller.ts

import { Request, Response, RequestHandler } from "express";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { VentaModel } from "../models/sales.model";
import { DetalleVentaModel } from "../models/detail_sales.model";
import { ProductoModel } from "../models/products.model";
import { ClienteModel } from "../models/clients.model";
import { CarritoModel } from "../models/carts.model";
import { CarritoProductoModel } from "../models/product_carts.model";
import sequelize from "../config/conection";

/**
 * 1) Obtener todas las ventas (lista básica)
 */
export const getAllSales: RequestHandler = async (req, res) => {
  try {
    const ventas = await VentaModel.findAll({
      order: [["fecha", "DESC"]],
      include: [
        {
          model: ClienteModel,
          attributes: ["id_cliente", "nombre", "apellido", "cedula"],
        },
        {
          model: DetalleVentaModel,
          include: [
            {
              model: ProductoModel,
              attributes: ["id_producto", "nombre", "categoria", "temporada"],
            },
          ],
        },
      ],
    });
    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener todas las ventas:", error);
    res.status(500).json({ msg: "Error al obtener todas las ventas" });
  }
};

/**
 * 2) Obtener el total vendido (sumatoria de `total` en ventas)
 */
export const getTotalRevenue: RequestHandler = async (req, res) => {
  try {
    const result = await VentaModel.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("total")), "totalVendido"],
      ],
      raw: true,
    });
    const totalVendido = parseFloat((result as any).totalVendido || 0);
    res.json({ totalVendido });
  } catch (error) {
    console.error("Error al calcular total vendido:", error);
    res.status(500).json({ msg: "Error al calcular total vendido" });
  }
};

/**
 * 3) Reporte de ingresos por temporada.
 *    Agrupa las ventas según la temporada de los productos vendidos.
 */
export const getIncomeBySeason: RequestHandler = async (_req, res) => {
  try {
    // Consulta SQL directa para agrupar por temporada y sumar subtotales
    const sql = `
      SELECT 
        p.temporada AS temporada, 
        SUM(d.subtotal) AS "ingresoTotal"
      FROM detalle_ventas d
      JOIN productos p ON d.id_producto = p.id_producto
      GROUP BY p.temporada;
    `;

    const ingresosPorTemporada = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
    // El resultado es un array de objetos: { temporada: 'alta', ingresoTotal: '123.00' }, etc.
    res.json(ingresosPorTemporada);
  } catch (error) {
    console.error("Error al generar reporte de ingresos por temporada:", error);
    res
      .status(500)
      .json({ msg: "Error al generar reporte de ingresos por temporada" });
  }
};

/**
 * 4) Reporte de productos con estado, descuento y alerta de stock.
 *    - estado: 'agotado' si stock = 0; 'mínimo' si stock ≤ 5; 'disponible' en otro caso.
 *    - descuento: depende de temporada: alta→0, media→25%, baja→35%.
 *    - alerta: si stock ≤ 5 (mínimo) o stock = 0 (agotado).
 */
export const getProductReport: RequestHandler = async (req, res) => {
  try {
    const productos = await ProductoModel.findAll({ raw: true });

    const reporte = productos.map((p: any) => {
      const stock: number = p.stock;
      const temporada: string = p.temporada;
      let estado: string;
      if (stock === 0) estado = "agotado";
      else if (stock <= 5) estado = "mínimo";
      else estado = "disponible";

      let descuentoRate = 0;
      if (temporada === "media") descuentoRate = 0.25;
      else if (temporada === "baja") descuentoRate = 0.35;

      const precioBase: number = parseFloat(p.precio);
      const precioConDescuento = parseFloat(
        (precioBase * (1 - descuentoRate)).toFixed(2)
      );
      const tieneAlerta = stock <= 5;

      return {
        id_producto: p.id_producto,
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

/**
 * 5) Reporte de clientes frecuentes con más de X compras en el último mes.
 *    Se pasa X como query param: /reportes/frecuentes?minCompras=3
 */
export const getFrequentCustomers: RequestHandler = async (req, res) => {
  try {
    const minCompras = parseInt(req.query.minCompras as string) || 1;
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    // 1) Agrupar por id_cliente contando ventas en el último mes
    const frecuentes = await VentaModel.findAll({
      attributes: [
        "id_cliente",
        [Sequelize.fn("COUNT", Sequelize.col("id_venta")), "cantidadVentas"],
      ],
      where: {
        fecha: { [Op.gte]: haceUnMes },
      },
      group: ["id_cliente"],
      having: Sequelize.literal(`COUNT(id_venta) > ${minCompras}`),
      raw: true,
    });

    // 2) Para cada fila (id_cliente, cantidadVentas), hacemos un findByPk SIN email
    const result = await Promise.all(
      frecuentes.map(async (fila: any) => {
        const cliente = await ClienteModel.findByPk(fila.id_cliente, {
          attributes: ["id_cliente", "nombre", "apellido", "cedula"], 
          raw: true,
        });
        return {
          cliente: cliente ? cliente : null,
          cantidadVentas: parseInt(fila.cantidadVentas, 10),
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Error al generar reporte de clientes frecuentes:", error);
    res
      .status(500)
      .json({ msg: "Error al generar reporte de clientes frecuentes" });
  }
};
/**
 * 6) Reporte de productos que no se han vendido nunca.
 *    Son aquellos cuya id_producto no aparece en detalle_ventas.
 */
export const getUnsoldProducts: RequestHandler = async (req, res) => {
  try {
    // Subconsulta: traer todos los id_producto vendidos
    const vendidos = await DetalleVentaModel.findAll({
      attributes: ["id_producto"],
      group: ["id_producto"],
      raw: true,
    });
    const idsVendidos = vendidos.map((v: any) => v.id_producto);

    // Productos cuyo id_producto NO esté en idsVendidos
    const noVendidos = await ProductoModel.findAll({
      where: {
        id_producto: { [Op.notIn]: idsVendidos },
      },
      attributes: ["id_producto", "nombre", "categoria", "stock", "temporada"],
      raw: true,
    });

    res.json(noVendidos);
  } catch (error) {
    console.error("Error al generar reporte de productos no vendidos:", error);
    res
      .status(500)
      .json({ msg: "Error al generar reporte de productos no vendidos" });
  }
};

/**
 * 7) Reporte de carrito abandonado:
 *    Clientes que tienen items en carrito abierto (estado = 'activo')
 *    y no han confirmado esa venta (no existe venta para ese carrito).
 */
export const getAbandonedCarts: RequestHandler = async (req, res) => {
  try {
    // 1) Obtener todos los carritos con estado 'activo'
    const carritosActivos = await CarritoModel.findAll({
      where: { estado: "activo" },
      raw: true,
    });

    const result: any[] = [];

    // 2) Recorremos cada carrito activo
    for (const carrito of carritosActivos as any[]) {
      const idCarrito = carrito.id_carrito as number;

      // 2a) ¿Tiene al menos un registro en carrito_productos?
      const existeItem = await CarritoProductoModel.findOne({
        where: { id_carrito: idCarrito },
        attributes: ["id_carrito"],
        raw: true,
      });
      if (!existeItem) {
        // Si no tiene items, no lo consideramos “abandonado”
        continue;
      }

      // 2b) ¿Existe una venta asociada a este id_carrito?
      const ventaAsociada = await VentaModel.findOne({
        where: { id_carrito: idCarrito },
        attributes: ["id_venta"],
        raw: true,
      });
      if (ventaAsociada) {
        // Si ya hay venta, tampoco es carrito “abandonado”
        continue;
      }

      // 3) Si llegamos aquí, es un carrito activo + tiene items + no tiene venta → abandonado
      // Obtenemos datos del cliente (SIN incluir email)
      const cliente = await ClienteModel.findByPk(carrito.id_cliente, {
        attributes: ["id_cliente", "nombre", "apellido", "cedula"],
        raw: true,
      });

      result.push({
        id_carrito: idCarrito,
        cliente: cliente ? cliente : null,
        fecha: carrito.fecha, // vendrá en formato Date o string según tu tabla
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error al generar reporte de carritos abandonados:", error);
    res
      .status(500)
      .json({ msg: "Error al generar reporte de carritos abandonados" });
  }
};