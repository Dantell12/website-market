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
exports.getAllSalesAdmin = exports.getSalesByClient = exports.confirmSale = void 0;
const carts_model_1 = require("../models/carts.model");
const products_model_1 = require("../models/products.model");
const sales_model_1 = require("../models/sales.model");
const users_model_1 = require("../models/users.model");
const mongoose_1 = require("mongoose");
const mongodb_1 = require("mongodb");
/**
 * Confirmar venta de un carrito
 * Recibe el id_cliente como string (MongoDB _id)
 */
// src/controllers/sales.controller.ts
const confirmSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id_cliente = req.params.id_cliente;
    if (!id_cliente || !mongoose_1.Types.ObjectId.isValid(id_cliente)) {
        res.status(400).json({ msg: "ID de cliente inválido" });
        return;
    }
    const clienteId = new mongoose_1.Types.ObjectId(id_cliente);
    // Buscar carrito activo
    const carrito = yield carts_model_1.Carrito.findOne({ id_cliente: clienteId, estado: "activo" });
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
        const prod = yield products_model_1.Producto.findById(item.id_producto);
        if (!prod) {
            res.status(404).json({ msg: `Producto ${item.id_producto} no encontrado` });
            return;
        }
        if (typeof prod.stock !== "number") {
            res.status(500).json({ msg: `Stock inválido en ${prod.nombre}` });
            return;
        }
        prod.stock -= item.cantidad;
        yield prod.save();
    }
    // Construir detalle y totales
    let subtotal = 0, impuestos = 0, total = 0;
    const detalle = carrito.productos.map(item => {
        const cantidadNum = Number(item.cantidad);
        const precioUnit = Number(item.precio_unitario);
        const imp = Number(item.impuesto || 0);
        const lineSub = precioUnit * cantidadNum;
        subtotal += lineSub;
        impuestos += imp;
        total += lineSub + imp;
        return {
            id_producto: new mongoose_1.Types.ObjectId(item.id_producto),
            cantidad: new mongodb_1.Int32(cantidadNum),
            precio_unitario: precioUnit,
            impuesto: imp,
            subtotal: lineSub
        };
    });
    const ventaData = {
        id_cliente: clienteId,
        id_carrito: carrito._id,
        fecha: new Date(),
        subtotal,
        impuestos,
        total,
        detalle
    };
    try {
        // ¡Usamos bypassDocumentValidation para saltar el validador JSON-Schema!
        const result = yield sales_model_1.Venta.collection.insertOne(ventaData, {
            bypassDocumentValidation: true
        });
        // Marcar carrito completado
        yield carts_model_1.Carrito.updateOne({ _id: carrito._id }, { $set: { estado: "completado" } });
        res.json({ msg: "Venta realizada con éxito", id_venta: result.insertedId });
    }
    catch (err) {
        console.error("Error al confirmar venta:", err);
        res.status(500).json({ msg: "Error al procesar la venta" });
    }
});
exports.confirmSale = confirmSale;
/**
 * Obtener ventas de un cliente
 * Recibe id_cliente como parámetro (MongoDB _id)
 */
const getSalesByClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id_cliente = req.params.id_cliente;
    if (!id_cliente || !mongoose_1.Types.ObjectId.isValid(id_cliente)) {
        res.status(400).json({ msg: "ID de cliente inválido" });
        return;
    }
    const clienteId = new mongoose_1.Types.ObjectId(id_cliente);
    try {
        // Buscar usuario
        const usuario = yield users_model_1.Usuario.findById(clienteId);
        if (!usuario || usuario.rol !== "cliente" || !usuario.cliente) {
            res.status(404).json({ msg: "Cliente no encontrado" });
            return;
        }
        // Obtener todas las ventas del usuario
        const ventas = yield sales_model_1.Venta.find({ id_cliente: clienteId }).sort({ fecha: -1 });
        // Por cada venta, obtener sus detalles (productos)
        const result = yield Promise.all(ventas.map((venta) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const lineas = yield Promise.all(((_a = venta.detalle) !== null && _a !== void 0 ? _a : []).map((d) => __awaiter(void 0, void 0, void 0, function* () {
                const prod = yield products_model_1.Producto.findById(d.id_producto);
                return {
                    cantidad: d.cantidad,
                    precio_unitario: d.precio_unitario,
                    impuesto: d.impuesto,
                    subtotal: d.subtotal,
                    producto: prod ? prod.toJSON() : null,
                };
            })));
            return {
                id_venta: venta._id,
                fecha: venta.fecha,
                subtotal: venta.subtotal,
                impuestos: venta.impuestos,
                total: venta.total,
                detalles: lineas,
            };
        })));
        // Enviar ventas y datos del cliente
        res.json({
            cliente: usuario.cliente,
            ventas: result,
        });
    }
    catch (error) {
        console.error("Error al obtener ventas del cliente:", error);
        res.status(500).json({ msg: "Error al obtener las ventas del cliente" });
    }
});
exports.getSalesByClient = getSalesByClient;
/**
 * Controlador para que el ADMIN obtenga todas las ventas
 * con cliente y detalles de cada venta.
 */
const getAllSalesAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Traer todas las ventas ordenadas por fecha descendente
        const ventas = yield sales_model_1.Venta.find().sort({ fecha: -1 });
        // Para cada venta, obtener su detalle, los datos de producto y el cliente manualmente
        const result = yield Promise.all(ventas.map((venta) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const usuario = yield users_model_1.Usuario.findById(venta.id_cliente);
            const lineas = yield Promise.all(((_a = venta.detalle) !== null && _a !== void 0 ? _a : []).map((d) => __awaiter(void 0, void 0, void 0, function* () {
                const prod = yield products_model_1.Producto.findById(d.id_producto);
                return {
                    cantidad: d.cantidad,
                    precio_unitario: d.precio_unitario,
                    impuesto: d.impuesto,
                    subtotal: d.subtotal,
                    producto: prod ? prod.toJSON() : null,
                };
            })));
            return {
                id_venta: venta._id,
                fecha: venta.fecha,
                subtotal: venta.subtotal,
                impuestos: venta.impuestos,
                total: venta.total,
                cliente: usuario && usuario.cliente ? usuario.cliente : null,
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
