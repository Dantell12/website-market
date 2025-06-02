// src/interfaces/cart-item.interface.ts

import type { ProductInterface } from "./product.interface";

export interface CartItemInterface {
  id_carrito_pro: number;
  id_carrito: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  impuesto: number;
  subtotal: number;
  producto: ProductInterface | null;
}
