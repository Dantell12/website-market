import { Router } from "express";
import { addProductToCart, listCartProducts, removeProductFromCart, updateCartProduct } from "../controllers/cart.controller";
import validateToken from "../middleware/validateToken";

const router = Router();

// Ruta para agregar un producto al carrito
router.post("/agregar-producto", validateToken, addProductToCart);

// Ruta para listar productos del carrito
router.get("/listar-productos/:id_cliente", validateToken, listCartProducts);
router.delete("/eliminar-productos/:id_cliente/:id_producto", validateToken, removeProductFromCart);
router.put("/update-productos/:id_cliente/:id_producto/:cantidad", validateToken, updateCartProduct);

export default router;
