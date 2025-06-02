"use strict";
// src/controllers/reportes.controller.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbandonedCarts = exports.getUnsoldProducts = exports.getFrequentCustomers = exports.getProductReport = exports.getIncomeBySeason = exports.getTotalRevenue = exports.getAllSales = void 0;
const sequelize_1 = require("sequelize");
const sales_model_1 = require("../models/sales.model");
const detail_sales_model_1 = require("../models/detail_sales.model");
const products_model_1 = require("../models/products.model");
const clients_model_1 = require("../models/clients.model");
const carts_model_1 = require("../models/carts.model");
const product_carts_model_1 = require("../models/product_carts.model");
const conection_1 = __importDefault(require("../config/conection"));
/**
 * 1) Obtener todas las ventas (lista básica)
 */
const getAllSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ventas = yield sales_model_1.VentaModel.findAll({
            order: [["fecha", "DESC"]],
            include: [
                {
                    model: clients_model_1.ClienteModel,
                    attributes: ["id_cliente", "nombre", "apellido", "cedula"],
                },
                {
                    model: detail_sales_model_1.DetalleVentaModel,
                    include: [
                        {
                            model: products_model_1.ProductoModel,
                            attributes: ["id_producto", "nombre", "categoria", "temporada"],
                        },
                    ],
                },
            ],
        });
        res.json(ventas);
    }
    catch (error) {
        console.error("Error al obtener todas las ventas:", error);
        res.status(500).json({ msg: "Error al obtener todas las ventas" });
    }
});
exports.getAllSales = getAllSales;
/**
 * 2) Obtener el total vendido (sumatoria de `total` en ventas)
 */
const getTotalRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield sales_model_1.VentaModel.findOne({
            attributes: [
                [sequelize_1.Sequelize.fn("SUM", sequelize_1.Sequelize.col("total")), "totalVendido"],
            ],
            raw: true,
        });
        const totalVendido = parseFloat(result.totalVendido || 0);
        res.json({ totalVendido });
    }
    catch (error) {
        console.error("Error al calcular total vendido:", error);
        res.status(500).json({ msg: "Error al calcular total vendido" });
    }
});
exports.getTotalRevenue = getTotalRevenue;
/**
 * 3) Reporte de ingresos por temporada.
 *    Agrupa las ventas según la temporada de los productos vendidos.
 */
const getIncomeBySeason = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const ingresosPorTemporada = yield conection_1.default.query(sql, {
            type: sequelize_1.QueryTypes.SELECT,
        });
        // El resultado es un array de objetos: { temporada: 'alta', ingresoTotal: '123.00' }, etc.
        res.json(ingresosPorTemporada);
    }
    catch (error) {
        console.error("Error al generar reporte de ingresos por temporada:", error);
        res
            .status(500)
            .json({ msg: "Error al generar reporte de ingresos por temporada" });
    }
});
exports.getIncomeBySeason = getIncomeBySeason;
/**
 * 4) Reporte de productos con estado, descuento y alerta de stock.
 *    - estado: 'agotado' si stock = 0; 'mínimo' si stock ≤ 5; 'disponible' en otro caso.
 *    - descuento: depende de temporada: alta→0, media→25%, baja→35%.
 *    - alerta: si stock ≤ 5 (mínimo) o stock = 0 (agotado).
 */
const getProductReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = yield products_model_1.ProductoModel.findAll({ raw: true });
        const reporte = productos.map((p) => {
            const stock = p.stock;
            const temporada = p.temporada;
            let estado;
            if (stock === 0)
                estado = "agotado";
            else if (stock <= 5)
                estado = "mínimo";
            else
                estado = "disponible";
            let descuentoRate = 0;
            if (temporada === "media")
                descuentoRate = 0.25;
            else if (temporada === "baja")
                descuentoRate = 0.35;
            const precioBase = parseFloat(p.precio);
            const precioConDescuento = parseFloat((precioBase * (1 - descuentoRate)).toFixed(2));
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
    }
    catch (error) {
        console.error("Error al generar reporte de productos:", error);
        res.status(500).json({ msg: "Error al generar reporte de productos" });
    }
});
exports.getProductReport = getProductReport;
/**
 * 5) Reporte de clientes frecuentes con más de X compras en el último mes.
 *    Se pasa X como query param: /reportes/frecuentes?minCompras=3
 */
const getFrequentCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const minCompras = parseInt(req.query.minCompras) || 1;
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        // 1) Agrupar por id_cliente contando ventas en el último mes
        const frecuentes = yield sales_model_1.VentaModel.findAll({
            attributes: [
                "id_cliente",
                [sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("id_venta")), "cantidadVentas"],
            ],
            where: {
                fecha: { [sequelize_1.Op.gte]: haceUnMes },
            },
            group: ["id_cliente"],
            having: sequelize_1.Sequelize.literal(`COUNT(id_venta) > ${minCompras}`),
            raw: true,
        });
        // 2) Para cada fila (id_cliente, cantidadVentas), hacemos un findByPk SIN email
        const result = yield Promise.all(frecuentes.map((fila) => __awaiter(void 0, void 0, void 0, function* () {
            const cliente = yield clients_model_1.ClienteModel.findByPk(fila.id_cliente, {
                attributes: ["id_cliente", "nombre", "apellido", "cedula"],
                raw: true,
            });
            return {
                cliente: cliente ? cliente : null,
                cantidadVentas: parseInt(fila.cantidadVentas, 10),
            };
        })));
        res.json(result);
    }
    catch (error) {
        console.error("Error al generar reporte de clientes frecuentes:", error);
        res
            .status(500)
            .json({ msg: "Error al generar reporte de clientes frecuentes" });
    }
});
exports.getFrequentCustomers = getFrequentCustomers;
/**
 * 6) Reporte de productos que no se han vendido nunca.
 *    Son aquellos cuya id_producto no aparece en detalle_ventas.
 */
const getUnsoldProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Subconsulta: traer todos los id_producto vendidos
        const vendidos = yield detail_sales_model_1.DetalleVentaModel.findAll({
            attributes: ["id_producto"],
            group: ["id_producto"],
            raw: true,
        });
        const idsVendidos = vendidos.map((v) => v.id_producto);
        // Productos cuyo id_producto NO esté en idsVendidos
        const noVendidos = yield products_model_1.ProductoModel.findAll({
            where: {
                id_producto: { [sequelize_1.Op.notIn]: idsVendidos },
            },
            attributes: ["id_producto", "nombre", "categoria", "stock", "temporada"],
            raw: true,
        });
        res.json(noVendidos);
    }
    catch (error) {
        console.error("Error al generar reporte de productos no vendidos:", error);
        res
            .status(500)
            .json({ msg: "Error al generar reporte de productos no vendidos" });
    }
});
exports.getUnsoldProducts = getUnsoldProducts;
/**
 * 7) Reporte de carrito abandonado:
 *    Clientes que tienen items en carrito abierto (estado = 'activo')
 *    y no han confirmado esa venta (no existe venta para ese carrito).
 */
const getAbandonedCarts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Obtener todos los carritos con estado 'activo'
        const carritosActivos = yield carts_model_1.CarritoModel.findAll({
            where: { estado: "activo" },
            raw: true,
        });
        const result = [];
        // 2) Recorremos cada carrito activo
        for (const carrito of carritosActivos) {
            const idCarrito = carrito.id_carrito;
            // 2a) ¿Tiene al menos un registro en carrito_productos?
            const existeItem = yield product_carts_model_1.CarritoProductoModel.findOne({
                where: { id_carrito: idCarrito },
                attributes: ["id_carrito"],
                raw: true,
            });
            if (!existeItem) {
                // Si no tiene items, no lo consideramos “abandonado”
                continue;
            }
            // 2b) ¿Existe una venta asociada a este id_carrito?
            const ventaAsociada = yield sales_model_1.VentaModel.findOne({
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
            const cliente = yield clients_model_1.ClienteModel.findByPk(carrito.id_cliente, {
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
    }
    catch (error) {
        console.error("Error al generar reporte de carritos abandonados:", error);
        res
            .status(500)
            .json({ msg: "Error al generar reporte de carritos abandonados" });
    }
});
exports.getAbandonedCarts = getAbandonedCarts;
