"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbandonedCarts = exports.getUnsoldProducts = exports.getFrequentCustomers = exports.getProductReport = exports.getIncomeBySeason = exports.getTotalRevenue = exports.getAllSales = void 0;
const sales_model_1 = require("../models/sales.model");
const users_model_1 = require("../models/users.model");
const products_model_1 = require("../models/products.model");
const carts_model_1 = require("../models/carts.model");
// 1) Obtener todas las ventas (lista básica)
const getAllSales = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ventas = yield sales_model_1.Venta.find()
            .sort({ fecha: -1 })
            .populate({
            path: "id_cliente",
            select: "nombre apellido cedula",
            model: users_model_1.Usuario,
        })
            .populate({
            path: "detalle.id_producto",
            select: "nombre categoria temporada",
            model: products_model_1.Producto,
        })
            .lean();
        res.json(ventas);
    }
    catch (error) {
        console.error("Error al obtener todas las ventas:", error);
        res.status(500).json({ msg: "Error al obtener todas las ventas" });
    }
});
exports.getAllSales = getAllSales;
const getTotalRevenue = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const result = yield sales_model_1.Venta.aggregate([
            { $group: { _id: null, totalVendido: { $sum: "$total" } } }
        ]);
        const totalVendido = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalVendido) || 0;
        res.json({ totalVendido });
    }
    catch (error) {
        console.error("Error al calcular total vendido:", error);
        res.status(500).json({ msg: "Error al calcular total vendido" });
    }
});
exports.getTotalRevenue = getTotalRevenue;
const getIncomeBySeason = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Unwind para detalle, lookup para producto, group por temporada
        const result = yield sales_model_1.Venta.aggregate([
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
    }
    catch (error) {
        console.error("Error al generar reporte de ingresos por temporada:", error);
        res.status(500).json({ msg: "Error al generar reporte de ingresos por temporada" });
    }
});
exports.getIncomeBySeason = getIncomeBySeason;
const getProductReport = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = yield products_model_1.Producto.find().lean();
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
    }
    catch (error) {
        console.error("Error al generar reporte de productos:", error);
        res.status(500).json({ msg: "Error al generar reporte de productos" });
    }
});
exports.getProductReport = getProductReport;
const getFrequentCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const minCompras = parseInt(req.query.minCompras) || 1;
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        const result = yield sales_model_1.Venta.aggregate([
            { $match: { fecha: { $gte: haceUnMes } } },
            { $group: { _id: "$id_cliente", cantidadVentas: { $sum: 1 } } },
            { $match: { cantidadVentas: { $gt: minCompras } } }
        ]);
        // Traer datos del cliente
        const clientes = yield Promise.all(result.map((fila) => __awaiter(void 0, void 0, void 0, function* () {
            const usuario = yield users_model_1.Usuario.findById(fila._id).lean();
            // Soporta tanto usuario.cliente como root
            const cliente = (usuario === null || usuario === void 0 ? void 0 : usuario.cliente)
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
        })));
        res.json(clientes);
    }
    catch (error) {
        console.error("Error al generar reporte de clientes frecuentes:", error);
        res.status(500).json({ msg: "Error al generar reporte de clientes frecuentes" });
    }
});
exports.getFrequentCustomers = getFrequentCustomers;
const getUnsoldProducts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Traer todos los id_producto vendidos
        const vendidos = yield sales_model_1.Venta.aggregate([
            { $unwind: "$detalle" },
            { $group: { _id: "$detalle.id_producto" } }
        ]);
        const idsVendidos = vendidos.map((v) => v._id);
        // Productos cuyo _id NO esté en idsVendidos
        const noVendidos = yield products_model_1.Producto.find({ _id: { $nin: idsVendidos } })
            .select("nombre categoria stock temporada")
            .lean();
        res.json(noVendidos);
    }
    catch (error) {
        console.error("Error al generar reporte de productos no vendidos:", error);
        res.status(500).json({ msg: "Error al generar reporte de productos no vendidos" });
    }
});
exports.getUnsoldProducts = getUnsoldProducts;
const getAbandonedCarts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Carritos activos con productos y sin venta asociada
        const carritos = yield carts_model_1.Carrito.find({ estado: "activo", "productos.0": { $exists: true } }).lean();
        const result = [];
        for (const carrito of carritos) {
            // ¿Existe una venta asociada a este carrito?
            const ventaAsociada = yield sales_model_1.Venta.findOne({ id_carrito: carrito._id });
            if (ventaAsociada)
                continue;
            // Datos del cliente
            const usuario = yield users_model_1.Usuario.findById(carrito.id_cliente).lean();
            const cliente = (usuario === null || usuario === void 0 ? void 0 : usuario.cliente)
                ? {
                    nombre: usuario.cliente.nombre,
                    apellido: usuario.cliente.apellido,
                    cedula: usuario.cliente.cedula,
                    direccion: usuario.cliente.direccion,
                }
                : null;
            result.push({
                id_carrito: (_a = carrito._id) === null || _a === void 0 ? void 0 : _a.toString(),
                numero: carrito.numero, // <-- agrega esto si existe el campo
                cliente,
                fecha: carrito.fecha,
            });
        }
        res.json(result);
    }
    catch (error) {
        console.error("Error al generar reporte de carritos abandonados:", error);
        res.status(500).json({ msg: "Error al generar reporte de carritos abandonados" });
    }
});
exports.getAbandonedCarts = getAbandonedCarts;
