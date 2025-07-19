import { Router } from "express";
import validateToken from "../middleware/validateToken";
import { confirmSale, getAllSalesAdmin, getSalesByClient } from "../controllers/sales.controller";

const router = Router();

router.post("/confirm-sale/:id_cliente", validateToken, confirmSale);
router.get("/client-sale/:id_cliente", validateToken, getSalesByClient);
router.get("/getSales", validateToken, getAllSalesAdmin);

export default router;