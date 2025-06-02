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
const products_model_1 = require("../models/products.model");
const product_carts_model_1 = require("../models/product_carts.model");
const carts_model_1 = require("../models/carts.model");
const calculates_1 = require("../utils/calculates");
const addProductToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_cliente, id_producto, cantidad } = req.body;
    console.log(id_cliente);
    try {
        // 1. Verificar si existe un carrito ACTIVO del cliente
        let carrito = yield carts_model_1.CarritoModel.findOne({
            where: { id_cliente, estado: "activo" },
        });
        console.log(carrito);
        // 2. Si no existe, crear uno
        if (!carrito) {
            carrito = yield carts_model_1.CarritoModel.create({
                id_cliente,
                estado: "activo",
            });
        }
        const idCarrito = carrito.get("id_carrito");
        const existente = yield product_carts_model_1.CarritoProductoModel.findOne({
            where: { id_carrito: idCarrito, id_producto },
        });
        if (existente) {
            res.status(400).json({ msg: "El producto ya está agregado al carrito" });
            return;
        }
        // 3. Buscar el producto
        const producto = yield products_model_1.ProductoModel.findByPk(id_producto);
        if (!producto) {
            res.status(404).json({ msg: "Producto no encontrado" });
            return;
        }
        const stock = producto.get("stock");
        // 4. Validar si hay suficiente stock
        if (stock < cantidad) {
            res
                .status(400)
                .json({ msg: "Stock insuficiente para agregar al carrito" });
            return;
        }
        // 5. Calcular precios (descuento e impuesto)
        const { precioConDescuento, impuesto, subtotal } = (0, calculates_1.calcularPrecioFinal)(producto, cantidad);
        // 6. Agregar producto al carrito
        const item = yield product_carts_model_1.CarritoProductoModel.create({
            id_carrito: carrito.get("id_carrito"),
            id_producto,
            cantidad,
            precio_unitario: precioConDescuento,
            impuesto,
            subtotal,
        });
        res.status(201).json({
            msg: "Producto agregado al carrito",
            item,
            id_carrito: carrito.get("id_carrito"),
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error al agregar producto al carrito" });
    }
});
exports.addProductToCart = addProductToCart;
// 2. Listar productos del carrito
const listCartProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_cliente } = req.params;
    try {
        const clienteId = parseInt(id_cliente);
        if (isNaN(clienteId)) {
            res.status(400).json({ msg: "ID de cliente inválido" });
            return;
        }
        // 1. Buscar carrito ACTIVO del cliente
        const carrito = yield carts_model_1.CarritoModel.findOne({
            where: { id_cliente: clienteId, estado: "activo" },
        });
        if (!carrito) {
            res.status(404).json({ msg: "Carrito no encontrado o inactivo" });
            return;
        }
        const idCarrito = carrito.get("id_carrito");
        // 2. Buscar productos del carrito
        const carritoProductos = yield product_carts_model_1.CarritoProductoModel.findAll({
            where: { id_carrito: idCarrito },
        });
        // Obtener todos los id_producto para la consulta
        const idsProductos = carritoProductos.map((item) => item.get("id_producto"));
        // 3. Buscar detalles de productos
        const productos = yield products_model_1.ProductoModel.findAll({
            where: { id_producto: idsProductos },
        });
        // 4. Combinar datos
        const respuesta = carritoProductos.map((item) => {
            const producto = productos.find((p) => p.get("id_producto") === item.get("id_producto"));
            return Object.assign(Object.assign({}, item.toJSON()), { producto: producto ? producto.toJSON() : null });
        });
        res.json(respuesta);
    }
    catch (error) {
        console.error("Error al listar productos del carrito:", error);
        res.status(500).json({ msg: "Error al listar productos del carrito" });
    }
});
exports.listCartProducts = listCartProducts;
// 3. Eliminar un producto del carrito activo
const removeProductFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id_cliente = parseInt(req.params.id_cliente, 10);
    const id_producto = parseInt(req.params.id_producto, 10);
    try {
        // 1. Buscar carrito ACTIVO del cliente
        const carrito = yield carts_model_1.CarritoModel.findOne({
            where: { id_cliente, estado: "activo" },
        });
        if (!carrito) {
            res.status(404).json({ msg: "Carrito no encontrado o inactivo" });
            return;
        }
        const idCarrito = carrito.get("id_carrito");
        // 2. Buscar el item en carrito_productos
        const item = yield product_carts_model_1.CarritoProductoModel.findOne({
            where: { id_carrito: idCarrito, id_producto },
        });
        if (!item) {
            res.status(404).json({ msg: "El producto no está en el carrito" });
            return;
        }
        // 3. Eliminar el item
        yield item.destroy();
        res.json({ msg: "Producto eliminado del carrito" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error al eliminar producto del carrito" });
    }
});
exports.removeProductFromCart = removeProductFromCart;
/**
 * PUT /api/carts/update-product
 * Actualiza la cantidad de un producto en el carrito activo del cliente
 * Body: { id_cliente, id_producto, cantidad }
 */
const updateCartProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extraemos de params en lugar de body
    const id_cliente = parseInt(req.params.id_cliente, 10);
    const id_producto = parseInt(req.params.id_producto, 10);
    const cantidad = parseInt(req.params.cantidad, 10);
    try {
        // Verificar carrito activo
        const carrito = yield carts_model_1.CarritoModel.findOne({
            where: { id_cliente, estado: "activo" },
        });
        if (!carrito) {
            res.status(404).json({ msg: "Carrito no encontrado o ya confirmado" });
            return;
        }
        const idCarrito = carrito.get("id_carrito");
        // Buscar el item en carrito_productos
        const item = yield product_carts_model_1.CarritoProductoModel.findOne({
            where: { id_carrito: idCarrito, id_producto },
        });
        if (!item) {
            res.status(404).json({ msg: "El producto no está en el carrito" });
            return;
        }
        // 3️⃣ Buscar datos del producto original
        const producto = yield products_model_1.ProductoModel.findByPk(id_producto);
        if (!producto) {
            res.status(404).json({ msg: "Producto no encontrado" });
            return;
        }
        const stock = producto.get("stock");
        if (stock < cantidad) {
            res
                .status(400)
                .json({ msg: "Stock insuficiente para la cantidad solicitada" });
            return;
        }
        //  Recalcular precios con la nueva cantidad
        const { precioConDescuento, impuesto, subtotal } = (0, calculates_1.calcularPrecioFinal)(producto, cantidad);
        // 5️⃣ Actualizar el registro en carrito_productos
        yield item.update({
            cantidad,
            precio_unitario: precioConDescuento,
            impuesto,
            subtotal,
        });
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
