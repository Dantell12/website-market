// src/interfaces/sale.interface.ts

import type { ClientInterface } from "./client.interface";
import type { ProductInterface } from "./product.interface";

export interface SaleDetailInterface {
  cantidad: number;
  precio_unitario: number;
  impuesto: number;
  subtotal: number;
  producto: ProductInterface | null;
}

export interface SaleInterface {
    _id?: string;
  id_venta: string;      // ID de la venta (MongoDB _id)
  fecha: string;
  subtotal: number;
  impuestos: number;
  total: number;
  detalle: SaleDetailInterface[];
  cliente?: ClientInterface;  // Agregar cliente opcional
}
