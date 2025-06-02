"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const validateToken_1 = __importDefault(require("../middleware/validateToken"));
const router = (0, express_1.Router)();
// Ruta para agregar un producto al carrito
router.post("/agregar-producto", validateToken_1.default, cart_controller_1.addProductToCart);
// Ruta para listar productos del carrito
router.get("/listar-productos/:id_cliente", validateToken_1.default, cart_controller_1.listCartProducts);
router.delete("/eliminar-productos/:id_cliente/:id_producto", validateToken_1.default, cart_controller_1.removeProductFromCart);
router.put("/update-productos/:id_cliente/:id_producto/:cantidad", validateToken_1.default, cart_controller_1.updateCartProduct);
exports.default = router;
