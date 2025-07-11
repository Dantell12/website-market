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
exports.updateCartProduct = exports.removeProductFromCart = exports.listCartProducts = exports.addProductToCart = void 0;
const carts_model_1 = require("../models/carts.model");
const products_model_1 = require("../models/products.model");
const calculates_1 = require("../utils/calculates");
const mongoose_1 = require("mongoose");
// 1. Agregar producto al carrito
const addProductToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_cliente, id_producto, cantidad } = req.body;
    try {
        const clienteId = new mongoose_1.Types.ObjectId(id_cliente);
        const productoId = new mongoose_1.Types.ObjectId(id_producto);
        // 1. Buscar o crear carrito activo
        let carrito = yield carts_model_1.Carrito.findOne({
            id_cliente: clienteId,
            estado: "activo",
        });
        if (!carrito) {
            carrito = yield carts_model_1.Carrito.create({
                id_cliente: clienteId,
                estado: "activo",
                fecha: new Date(),
                productos: [],
            });
        }
        // 2. Verificar duplicado
        if (carrito.productos.some((p) => p.id_producto.equals(productoId))) {
            res.status(400).json({ msg: "El producto ya está en el carrito" });
            return;
        }
        // 3. Buscar producto y verificar stock
        const producto = yield products_model_1.Producto.findById(productoId);
        if (!producto) {
            res.status(404).json({ msg: "Producto no encontrado" });
            return;
        }
        if (producto.stock < cantidad) {
            res.status(400).json({ msg: "Stock insuficiente" });
            return;
        }
        // 4. Calcular precios
        const { precioConDescuento, impuesto, subtotal } = (0, calculates_1.calcularPrecioFinal)(producto, cantidad);
        carrito.productos.push({
            id_producto: productoId,
            cantidad: parseInt(cantidad, 10),
            precio_unitario: precioConDescuento,
            impuesto: typeof impuesto === "number" ? impuesto : 0,
            subtotal: typeof subtotal === "number" ? subtotal : 0,
        });
        yield carrito.save();
        res.status(201).json({
            msg: "Producto agregado al carrito",
            carrito,
        });
        return;
    }
    catch (err) {
        console.error("Error al agregar producto al carrito:", err);
        res.status(500).json({ msg: "Error al agregar producto al carrito" });
        return;
    }
});
exports.addProductToCart = addProductToCart;
// 2. Listar productos del carrito activo del cliente
const listCartProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_cliente } = req.params;
    try {
        const clienteId = new mongoose_1.Types.ObjectId(id_cliente);
        const carrito = yield carts_model_1.Carrito.findOne({
            id_cliente: clienteId,
            estado: "activo",
        }).populate("productos.id_producto");
        if (!carrito) {
            res.status(404).json({ msg: "Carrito no encontrado o inactivo" });
            return;
        }
        res.json(carrito.productos);
        return;
    }
    catch (err) {
        console.error("Error al listar productos del carrito:", err);
        res.status(500).json({ msg: "Error al listar productos del carrito" });
        return;
    }
});
exports.listCartProducts = listCartProducts;
// 3. Eliminar un producto del carrito activo
const removeProductFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_cliente, id_producto } = req.params;
    try {
        const clienteId = new mongoose_1.Types.ObjectId(id_cliente);
        const productoId = new mongoose_1.Types.ObjectId(id_producto);
        const carrito = yield carts_model_1.Carrito.findOne({
            id_cliente: clienteId,
            estado: "activo",
        });
        if (!carrito) {
            res.status(404).json({ msg: "Carrito no encontrado o inactivo" });
            return;
        }
        const idx = carrito.productos.findIndex((p) => p.id_producto.equals(productoId));
        if (idx === -1) {
            res.status(404).json({ msg: "El producto no está en el carrito" });
            return;
        }
        carrito.productos.splice(idx, 1);
        yield carrito.save();
        res.json({ msg: "Producto eliminado del carrito" });
        return;
    }
    catch (err) {
        console.error("Error al eliminar producto del carrito:", err);
        res.status(500).json({ msg: "Error al eliminar producto del carrito" });
        return;
    }
});
exports.removeProductFromCart = removeProductFromCart;
// 4. Actualizar cantidad de un producto en el carrito activo
const updateCartProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Extraer todo de params
        const { id_cliente, id_producto, cantidad: cantidadParam } = req.params;
        // 2) Parsear cantidad a número
        const cantidad = Math.floor(cantidadParam);
        if (isNaN(cantidad) || cantidad < 1) {
            res.status(400).json({ msg: "Cantidad inválida" });
            return;
        }
        const clienteId = new mongoose_1.Types.ObjectId(id_cliente);
        const productoId = new mongoose_1.Types.ObjectId(id_producto);
        // 3) Buscar carrito activo
        const carrito = yield carts_model_1.Carrito.findOne({
            id_cliente: clienteId,
            estado: "activo",
        });
        if (!carrito) {
            res.status(404).json({ msg: "Carrito no encontrado o inactivo" });
            return;
        }
        // 4) Buscar el item en el carrito
        const item = carrito.productos.find((p) => p.id_producto.equals(productoId));
        if (!item) {
            res.status(404).json({ msg: "El producto no está en el carrito" });
            return;
        }
        // 5) Verificar stock
        const producto = yield products_model_1.Producto.findById(productoId);
        if (!producto) {
            res.status(404).json({ msg: "Producto no encontrado" });
            return;
        }
        if (producto.stock < cantidad) {
            res.status(400).json({ msg: "Stock insuficiente" });
            return;
        }
        // 6) Recalcular precios
        const { precioConDescuento, impuesto, subtotal } = (0, calculates_1.calcularPrecioFinal)(producto, cantidad);
        item.cantidad = cantidad;
        item.precio_unitario = precioConDescuento;
        item.impuesto = impuesto;
        item.subtotal = subtotal;
        // 7) Guardar
        yield carrito.save();
        res.json({
            msg: "Cantidad actualizada correctamente",
            item,
        });
        return;
    }
    catch (err) {
        console.error("Error al actualizar producto del carrito:", err);
        res.status(500).json({ msg: "Error interno al actualizar el carrito" });
        return;
    }
});
exports.updateCartProduct = updateCartProduct;
