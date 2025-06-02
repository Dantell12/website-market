"use strict";
// src/controllers/product.controller.ts
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
        const list = yield products_model_1.ProductoModel.findAll();
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
        const product = yield products_model_1.ProductoModel.findByPk(id);
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
        const { codigo, nombre, categoria, precio, stock, temporada, img } = req.body;
        // Validar campos obligatorios
        if (!codigo ||
            !nombre ||
            !categoria ||
            precio == null ||
            stock == null ||
            !temporada) {
            res.status(400).json({
                msg: "Faltan datos obligatorios: código, nombre, categoría, precio, stock o temporada",
            });
        }
        // Verificar unicidad de código
        const exists = yield products_model_1.ProductoModel.findOne({ where: { codigo } });
        if (exists) {
            res.status(400).json({
                msg: `El código ${codigo} ya está registrado`,
            });
        }
        const newProduct = yield products_model_1.ProductoModel.create({
            codigo,
            nombre,
            categoria,
            precio,
            stock,
            temporada,
            img,
        });
        res.status(201).json({
            msg: "Producto creado correctamente",
            product: newProduct,
        });
    }
    catch (error) {
        console.error("Error al registrar producto:", error);
        res.status(500).json({
            msg: "Error al registrar producto",
        });
    }
});
exports.postProduct = postProduct;
/**
 * Metodo updateProduct
 * Actualiza un producto existente
 */
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { codigo, nombre, categoria, precio, stock, temporada, img } = req.body;
    try {
        const product = yield products_model_1.ProductoModel.findByPk(id);
        if (!product) {
            res.status(404).json({
                msg: `No existe un producto con id: ${id}`,
            });
            return;
        }
        // Si cambia el código, verificar que no choque con otro
        if (codigo && codigo !== product.get("codigo")) {
            const codeExists = yield products_model_1.ProductoModel.findOne({ where: { codigo } });
            if (codeExists) {
                res.status(400).json({
                    msg: `El código ${codigo} ya está registrado en otro producto`,
                });
            }
        }
        yield product.update({
            codigo: codigo !== null && codigo !== void 0 ? codigo : product.get("codigo"),
            nombre: nombre !== null && nombre !== void 0 ? nombre : product.get("nombre"),
            categoria: categoria !== null && categoria !== void 0 ? categoria : product.get("categoria"),
            precio: precio !== null && precio !== void 0 ? precio : product.get("precio"),
            stock: stock !== null && stock !== void 0 ? stock : product.get("stock"),
            temporada: temporada !== null && temporada !== void 0 ? temporada : product.get("temporada"),
            img: img !== null && img !== void 0 ? img : product.get("img"),
            // creado_en no lo tocamos
        });
        res.json({
            msg: "Producto actualizado correctamente",
            product,
        });
    }
    catch (error) {
        console.error(`Error al actualizar producto ${id}:`, error);
        res.status(500).json({
            msg: "Error al actualizar producto",
        });
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
        const deletedCount = yield products_model_1.ProductoModel.destroy({
            where: { id_producto: id },
        });
        if (deletedCount === 0) {
            res.status(404).json({
                msg: `No existe un producto con id: ${id}`,
            });
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
