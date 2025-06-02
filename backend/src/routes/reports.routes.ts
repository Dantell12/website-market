import { Router } from "express";
import {
  getAllSales,
  getTotalRevenue,
  getIncomeBySeason,
  getProductReport,
  getFrequentCustomers,
  getUnsoldProducts,
  getAbandonedCarts,
} from "../controllers/reports.controller";
import validateToken from "../middleware/validateToken";

const router = Router();

// 👉 Rutas protegidas (solo admin)
router.get("/", validateToken, getAllSales);
router.get("/total", validateToken, getTotalRevenue);
router.get("/temporada", validateToken, getIncomeBySeason);
router.get("/productos", validateToken, getProductReport);
router.get("/clientes-frecuentes", validateToken, getFrequentCustomers);
router.get("/productos-no-vendidos", validateToken, getUnsoldProducts);
router.get("/carritos-abandonados", validateToken, getAbandonedCarts);

export default router;
