"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateToken_1 = __importDefault(require("../middleware/validateToken"));
const sales_controller_1 = require("../controllers/sales.controller");
const router = (0, express_1.Router)();
// Ruta para realizar una venta de un carrito
router.post("/confirm-sale/:id_cliente", validateToken_1.default, sales_controller_1.confirmSale);
router.get("/client-sale/:id_cliente", validateToken_1.default, sales_controller_1.getSalesByClient);
router.get("/getSales", validateToken_1.default, sales_controller_1.getAllSalesAdmin);
exports.default = router;
