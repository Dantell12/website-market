"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const router = (0, express_1.Router)();
// 👉 Rutas protegidas (solo admin)
router.get("/", reports_controller_1.getAllSales);
router.get("/total", reports_controller_1.getTotalRevenue);
router.get("/temporada", reports_controller_1.getIncomeBySeason);
router.get("/productos", reports_controller_1.getProductReport);
router.get("/clientes-frecuentes", reports_controller_1.getFrequentCustomers);
router.get("/productos-no-vendidos", reports_controller_1.getUnsoldProducts);
router.get("/carritos-abandonados", reports_controller_1.getAbandonedCarts);
exports.default = router;
