"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const router = (0, express_1.Router)();
// Ruta para agregar un producto al carrito
router.post("/agregar-producto", cart_controller_1.addProductToCart);
// Ruta para listar productos del carrito
router.get("/listar-productos/:id_cliente", cart_controller_1.listCartProducts);
router.delete("/eliminar-productos/:id_cliente/:id_producto", cart_controller_1.removeProductFromCart);
router.put("/update-productos/:id_cliente/:id_producto/:cantidad", cart_controller_1.updateCartProduct);
exports.default = router;
