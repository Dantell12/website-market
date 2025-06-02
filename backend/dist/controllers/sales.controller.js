"use strict";
// src/controllers/sales.controller.ts
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
exports.getAllSalesAdmin = exports.getSalesByClient = exports.confirmSale = void 0;
const carts_model_1 = require("../models/carts.model");
const product_carts_model_1 = require("../models/product_carts.model");
const conection_1 = __importDefault(require("../config/conection"));
const sales_model_1 = require("../models/sales.model");
const detail_sales_model_1 = require("../models/detail_sales.model");
const products_model_1 = require("../models/products.model");
const clients_model_1 = require("../models/clients.model");
const sequelize_1 = require("sequelize");
const confirmSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clienteId = parseInt(req.params.id_cliente, 10);
    if (isNaN(clienteId)) {
        res.status(400).json({ msg: "ID de cliente inválido" });
        return;
    }
    const t = yield conection_1.default.transaction();
    try {
        //  Buscar carrito activo
        const carrito = yield carts_model_1.CarritoModel.findOne({
            where: { id_cliente: clienteId, estado: "activo" },
            transaction: t,
        });
        if (!carrito) {
            yield t.rollback();
            res.status(404).json({ msg: "No hay carrito activo para este cliente" });
            return;
        }
        const idCarrito = carrito.get("id_carrito");
        // 2️⃣ Obtener ítems del carrito
        const items = yield product_carts_model_1.CarritoProductoModel.findAll({
            where: { id_carrito: idCarrito },
            transaction: t,
        });
        if (items.length === 0) {
            yield t.rollback();
            res.status(400).json({ msg: "El carrito está vacío" });
            return;
        }
        // 3️⃣ Verificar y reducir stock de cada producto
        for (const item of items) {
            const prodId = item.get("id_producto");
            const qty = item.get("cantidad");
            // Lock FOR UPDATE para evitar race conditions
            const producto = yield products_model_1.ProductoModel.findByPk(prodId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!producto) {
                yield t.rollback();
                res.status(404).json({ msg: `Producto ${prodId} no encontrado` });
                return;
            }
            const stock = producto.get("stock");
            if (stock < qty) {
                yield t.rollback();
                res
                    .status(400)
                    .json({ msg: `Stock insuficiente para el producto ${prodId}` });
                return;
            }
            // Reducir stock
            yield producto.update({ stock: stock - qty }, { transaction: t });
        }
        //  Calcular totales
        let subtotal = 0, impuestos = 0, total = 0;
        items.forEach((item) => {
            const qty = item.get("cantidad");
            const unitTax = parseFloat(item.get("impuesto"));
            const lineSubtotal = parseFloat(item.get("subtotal"));
            const linePrice = parseFloat(item.get("precio_unitario")) * qty;
            subtotal += linePrice;
            impuestos += unitTax * qty;
            total += lineSubtotal;
        });
        // 5️⃣ Crear cabecera de venta
        const venta = yield sales_model_1.VentaModel.create({
            id_cliente: clienteId,
            id_carrito: idCarrito,
            subtotal,
            impuestos,
            total,
        }, { transaction: t });
        const idVenta = venta.get("id_venta");
        // 6️⃣ Crear detalle_ventas
        for (const item of items) {
            yield detail_sales_model_1.DetalleVentaModel.create({
                id_venta: idVenta,
                id_producto: item.get("id_producto"),
                cantidad: item.get("cantidad"),
                precio_unitario: item.get("precio_unitario"),
                impuesto: item.get("impuesto"),
                subtotal: item.get("subtotal"),
            }, { transaction: t });
        }
        //  Marcar carrito como confirmado
        yield carrito.update({ estado: "confirmado" }, { transaction: t });
        yield t.commit();
        res.json({ msg: "Venta realizada con éxito", id_venta: idVenta });
        return;
    }
    catch (error) {
        console.error("Error al confirmar venta:", error);
        yield t.rollback();
        res.status(500).json({ msg: "Error al procesar la venta" });
        return;
    }
});
exports.confirmSale = confirmSale;
const getSalesByClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clienteId = parseInt(req.params.id_cliente, 10);
    if (isNaN(clienteId)) {
        res.status(400).json({ msg: "ID de cliente inválido" });
        return;
    }
    try {
        // Buscar datos del cliente
        const cliente = yield clients_model_1.ClienteModel.findByPk(clienteId);
        if (!cliente) {
            res.status(404).json({ msg: "Cliente no encontrado" });
            return;
        }
        // Obtener todas las ventas del cliente
        const ventas = yield sales_model_1.VentaModel.findAll({
            where: { id_cliente: clienteId },
            order: [["fecha", "DESC"]],
        });
        // Por cada venta, obtener sus detalles
        const result = yield Promise.all(ventas.map((venta) => __awaiter(void 0, void 0, void 0, function* () {
            const idVenta = venta.get("id_venta");
            // Detalles de la venta
            const detalles = yield detail_sales_model_1.DetalleVentaModel.findAll({
                where: { id_venta: idVenta },
            });
            const idsProductos = detalles.map((d) => d.get("id_producto"));
            const productos = yield products_model_1.ProductoModel.findAll({
                where: { id_producto: idsProductos },
            });
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
                detalles: lineas,
            };
        })));
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
    }
    catch (error) {
        console.error("Error al obtener ventas del cliente:", error);
        res.status(500).json({ msg: "Error al obtener las ventas del cliente" });
        return;
    }
});
exports.getSalesByClient = getSalesByClient;
/**
 * Controlador para que el ADMIN obtenga todas las ventas
 * con cliente y detalles de cada venta.
 */ const getAllSalesAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Traer todas las ventas ordenadas por fecha descendente
        const ventas = yield sales_model_1.VentaModel.findAll({
            order: [["fecha", "DESC"]],
        });
        // 2) Para cada venta, obtener su detalle, los datos de producto y el cliente manualmente
        const result = yield Promise.all(ventas.map((venta) => __awaiter(void 0, void 0, void 0, function* () {
            const idVenta = venta.get("id_venta");
            const idCliente = venta.get("id_cliente");
            // Obtener datos del cliente
            const cliente = yield clients_model_1.ClienteModel.findByPk(idCliente, {
                attributes: ["id_cliente", "nombre", "apellido", "cedula", "direccion"],
            });
            // Obtener todos los detalles de esta venta
            const detalles = yield detail_sales_model_1.DetalleVentaModel.findAll({
                where: { id_venta: idVenta },
            });
            // Lista de IDs de producto para esta venta
            const idsProductos = detalles.map((d) => d.get("id_producto"));
            // Traer info de cada producto
            const productos = yield products_model_1.ProductoModel.findAll({
                where: { id_producto: { [sequelize_1.Op.in]: idsProductos } },
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
        })));
        res.json(result);
    }
    catch (error) {
        console.error("Error al obtener todas las ventas (Admin):", error);
        res.status(500).json({ msg: "Error al obtener todas las ventas" });
    }
});
exports.getAllSalesAdmin = getAllSalesAdmin;
