import { Router } from "express";
import { addProductToCart, listCartProducts, removeProductFromCart, updateCartProduct } from "../controllers/cart.controller";
import validateToken from "../middleware/validateToken";

const router = Router();

// Ruta para agregar un producto al carrito
router.post("/agregar-producto",  addProductToCart);

// Ruta para listar productos del carrito
router.get("/listar-productos/:id_cliente",listCartProducts);
router.delete("/eliminar-productos/:id_cliente/:id_producto",  removeProductFromCart);
router.put("/update-productos/:id_cliente/:id_producto/:cantidad",  updateCartProduct);

export default router;
