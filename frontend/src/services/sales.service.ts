// src/services/sales.service.ts

import api from "../axios.config";
import type { ClientSaleResponse } from "../interfaces/client-sale-response";

const API_URL = "http://localhost:1880/api/sales";

/**
 * Confirma la compra (registra la venta y sus detalles) para el carrito activo del cliente.
 * @param id_cliente El ID del cliente que confirma la compra.
 * @returns Un objeto con éxito y, en caso positivo, el ID de la venta.
 */
  export const confirmSale = async (id_cliente: string): Promise<{ success: boolean; msg: string }> => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await api.post(`/sales/confirm-sale/${id_cliente}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { success: true, msg: data.msg };
    } catch (error: any) {
      console.error("Error al confirmar venta:", error.response?.data || error.message);
      return { success: false, msg: error.response?.data?.msg || "Error al confirmar venta" };
    }
  };

/**
 * Obtiene todas las ventas de un cliente con sus detalles y la información del cliente.
 * @param id_cliente El ID del cliente.
 * @returns Un objeto con cliente y ventas, o null en caso de error.
 */
export const getSalesByClient = async (
  id_cliente: string
): Promise<ClientSaleResponse | null> => {
  try {
    const { data } = await api.get<ClientSaleResponse>(
      `${API_URL}/client-sale/${id_cliente}`
    );
    return data;
  } catch (error: any) {
    console.error(
      `Error al obtener ventas para el cliente ${id_cliente}:`,
      error
    );
    return null;
  }
};
/**
 * Obtiene todas las ventas (para el admin).
 * @returns Un array de ventas o null en caso de error.
 */
export const getAllSalesAdmin = async (): Promise<any[] | null> => {
  try {
    const { data } = await api.get<any[]>(
      "http://localhost:1880/api/sales/getSales"
    );
    return data;
  } catch (error: any) {
    console.error("Error al obtener todas las ventas (admin):", error);
    return null;
  }
};
