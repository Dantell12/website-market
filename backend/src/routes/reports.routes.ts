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
router.get("/",  getAllSales);
router.get("/total",  getTotalRevenue);
router.get("/temporada",  getIncomeBySeason);
router.get("/productos",  getProductReport);
router.get("/clientes-frecuentes",  getFrequentCustomers);
router.get("/productos-no-vendidos",  getUnsoldProducts);
router.get("/carritos-abandonados",  getAbandonedCarts);

export default router;
