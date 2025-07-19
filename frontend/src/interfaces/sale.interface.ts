// src/interfaces/sale.interface.ts

import type { ProductInterface } from "./product.interface";

export interface SaleDetailInterface {
  cantidad: number;
  precio_unitario: number;
  impuesto: number;
  subtotal: number;
  producto: ProductInterface | null;
}

export interface SaleInterface {
  id_venta: string;
  fecha: string;
  subtotal: number;
  impuestos: number;
  total: number;
  detalles: SaleDetailInterface[];
}
