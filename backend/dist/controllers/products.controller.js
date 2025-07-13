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
exports.deleteProduct = exports.updateProduct = exports.postProduct = exports.getProductById = exports.getProducts = void 0;
const products_model_1 = require("../models/products.model");
/**
 * Metodo getProducts
 * Devuelve lista de todos los productos
 */
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const list = yield products_model_1.Producto.find();
        if (list.length > 0) {
            res.json(list);
        }
        else {
            res.status(404).json({
                msg: "No se ha encontrado ningún producto",
            });
        }
    }
    catch (error) {
        console.error("Error al obtener lista de productos:", error);
        res.status(500).json({
            msg: "Error al obtener lista de productos",
        });
    }
});
exports.getProducts = getProducts;
/**
 * Metodo getProductById
 * Devuelve un producto por su ID
 */
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield products_model_1.Producto.findById(id);
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).json({
                msg: `No existe un producto con el id: ${id}`,
            });
        }
    }
    catch (error) {
        console.error(`Error al obtener producto ${id}:`, error);
        res.status(500).json({
            msg: "Error al obtener el producto",
        });
    }
});
exports.getProductById = getProductById;
/**
 * Metodo postProduct
 * Crea un nuevo producto
 */
const postProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, nombre, categoria, precio, stock, temporada } = req.body;
        if (!codigo || !nombre || !categoria || precio == null || stock == null || !temporada) {
            res.status(400).json({
                msg: "Faltan datos obligatorios",
            });
            return;
        }
        const exists = yield products_model_1.Producto.findOne({ codigo });
        if (exists) {
            res.status(400).json({ msg: `El código ${codigo} ya está registrado` });
            return;
        }
        let imgPath = undefined;
        if (req.file) {
            imgPath = req.file.filename; // Solo el nombre del archivo
        }
        // Verificar unicidad de código
        const newProduct = new products_model_1.Producto({
            codigo,
            nombre,
            categoria,
            precio,
            stock,
            temporada,
            img: imgPath,
            creado_en: new Date(),
        });
        yield newProduct.save();
        res.status(201).json({
            msg: "Producto creado correctamente",
            product: newProduct,
        });
    }
    catch (error) {
        console.error("Error al registrar producto:", error);
        res.status(500).json({ msg: "Error al registrar producto" });
    }
});
exports.postProduct = postProduct;
/**
 * Metodo updateProduct
 * Actualiza un producto existente
 */
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield products_model_1.Producto.findById(id);
        if (!product) {
            res.status(404).json({
                msg: `No existe un producto con id: ${id}`,
            });
            return;
        }
        const { codigo, nombre, categoria, temporada } = req.body;
        const precio = req.body.precio !== undefined ? parseFloat(req.body.precio) : undefined;
        const stock = req.body.stock !== undefined ? parseInt(req.body.stock, 10) : undefined;
        if ((precio !== undefined && isNaN(precio)) || (stock !== undefined && isNaN(stock))) {
            res.status(400).json({ msg: "Precio o stock inválidos" });
            return;
        }
        if (codigo && codigo !== product.codigo) {
            const codeExists = yield products_model_1.Producto.findOne({ codigo });
            if (codeExists) {
                res.status(400).json({ msg: `El código ${codigo} ya está registrado` });
                return;
            }
        }
        if (codigo !== undefined)
            product.codigo = codigo;
        if (nombre !== undefined)
            product.nombre = nombre;
        if (categoria !== undefined)
            product.categoria = categoria;
        if (precio !== undefined)
            product.precio = precio;
        if (stock !== undefined)
            product.stock = stock;
        if (temporada !== undefined)
            product.temporada = temporada;
        if (req.file) {
            product.img = req.file.filename; // Solo el nombre del archivo
        }
        yield product.save();
        res.json({
            msg: "Producto actualizado correctamente",
            product,
        });
    }
    catch (error) {
        console.error(`Error al actualizar producto ${id}:`, error);
        res.status(500).json({ msg: "Error al actualizar producto" });
    }
});
exports.updateProduct = updateProduct;
/**
 * Metodo deleteProduct
 * Elimina físicamente un producto
 */
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleted = yield products_model_1.Producto.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({
                msg: `No existe un producto con id: ${id}`,
            });
            return;
        }
        res.json({
            msg: "Producto eliminado correctamente",
        });
    }
    catch (error) {
        console.error(`Error al eliminar producto ${id}:`, error);
        res.status(500).json({
            msg: "Error al eliminar producto",
        });
    }
});
exports.deleteProduct = deleteProduct;
