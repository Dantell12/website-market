"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const validateToken_1 = __importDefault(require("../middleware/validateToken"));
const router = (0, express_1.Router)();
// 👉 Rutas protegidas (solo admin)
router.get("/", validateToken_1.default, reports_controller_1.getAllSales);
router.get("/total", validateToken_1.default, reports_controller_1.getTotalRevenue);
router.get("/temporada", validateToken_1.default, reports_controller_1.getIncomeBySeason);
router.get("/productos", validateToken_1.default, reports_controller_1.getProductReport);
router.get("/clientes-frecuentes", validateToken_1.default, reports_controller_1.getFrequentCustomers);
router.get("/productos-no-vendidos", validateToken_1.default, reports_controller_1.getUnsoldProducts);
router.get("/carritos-abandonados", validateToken_1.default, reports_controller_1.getAbandonedCarts);
exports.default = router;
