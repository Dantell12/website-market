// src/interfaces/cart-item.interface.ts
import type { ProductInterface } from "./product.interface";

export interface CartItemInterface {
  id_producto: string;        // el ObjectId como string
  cantidad: number;
  precio_unitario: number;
  impuesto?: number;
  subtotal?: number;
  producto?: ProductInterface; // debe incluir al menos _id, nombre, precio, etc.
}
