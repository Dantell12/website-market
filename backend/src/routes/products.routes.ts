import { Router } from "express";
import { getProducts, getProductById, postProduct, updateProduct, deleteProduct } from "../controllers/products.controller";
import upload from "../middleware/uploadImage";
import path from "path";

const router = Router();

// Ruta para obtener la imagen de un producto
router.get("/image/:filename", (req, res) => {
  res.sendFile(path.join(__dirname, `../../uploads/${req.params.filename}`));
});

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", upload.single("img"), postProduct);
router.put("/:id", upload.single("img"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;