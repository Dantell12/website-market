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

router.get("/",            validateToken, getProducts);
router.get("/:id",         validateToken, getProductById);
router.post("/",           validateToken, postProduct);
router.put("/:id",         validateToken, updateProduct);
router.delete("/:id",      validateToken, deleteProduct);

export default router;
