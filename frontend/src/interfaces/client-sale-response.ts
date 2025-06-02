// src/interfaces/client-sale-response.interface.ts
import type { ClientInterface } from "./client.interface";
import type { SaleInterface } from "./sale.interface";

export interface ClientSaleResponse {
  cliente: ClientInterface;
  ventas: SaleInterface[];
}
