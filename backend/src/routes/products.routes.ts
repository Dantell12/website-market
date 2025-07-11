import { Router } from "express";
import {
  getProducts,
  getProductById,
  postProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller";
import validateToken from "../middleware/validateToken";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", postProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
