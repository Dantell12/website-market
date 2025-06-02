// src/services/reportService.ts

import axios from "../axios.config";
import type {
  AbandonedCart,
  FrequentCustomer,
  IncomeBySeason,
  ProductReport,
  UnsoldProduct,
} from "../interfaces/reports.interface";

// Base URL de tu backend
const API_URL = "http://localhost:1880";

// 1) Obtener todas las ventas
export const getAllSales = async (): Promise<any[] | null> => {
  try {
    const { data } = await axios.get<any[]>(`${API_URL}/api/reports`);
    return data;
  } catch (error) {
    console.error("Error al listar todas las ventas:", error);
    return null;
  }
};

// 2) Obtener el total vendido
export const getTotalRevenue = async (): Promise<number | null> => {
  try {
    const { data } = await axios.get<{ totalVendido: number }>(
      `${API_URL}/api/reports/total`
    );
    return data.totalVendido;
  } catch (error) {
    console.error("Error al obtener total vendido:", error);
    return null;
  }
};

// 3) Ingresos por temporada
export const getIncomeBySeason = async (): Promise<IncomeBySeason[] | null> => {
  try {
    const { data } = await axios.get<IncomeBySeason[]>(
      `${API_URL}/api/reports/temporada`
    );
    return data;
  } catch (error) {
    console.error("Error al obtener ingresos por temporada:", error);
    return null;
  }
};

// 4) Reporte de productos con estado, descuento y alerta de stock
export const getProductReport = async (): Promise<ProductReport[] | null> => {
  try {
    const { data } = await axios.get<ProductReport[]>(
      `${API_URL}/api/reports/productos`
    );
    return data;
  } catch (error) {
    console.error("Error al obtener reporte de productos:", error);
    return null;
  }
};

// 5) Reporte de clientes frecuentes
export const getFrequentCustomers = async (
  minCompras: number = 1
): Promise<FrequentCustomer[] | null> => {
  try {
    const { data } = await axios.get<FrequentCustomer[]>(
      `${API_URL}/api/reports/clientes-frecuentes?minCompras=${minCompras}`
    );
    return data;
  } catch (error) {
    console.error("Error al obtener clientes frecuentes:", error);
    return null;
  }
};


export const getUnsoldProducts = async (): Promise<UnsoldProduct[] | null> => {
  try {
    const { data } = await axios.get<UnsoldProduct[]>(
      `${API_URL}/api/reports/productos-no-vendidos`
    );
    return data;
  } catch (error) {
    console.error("Error al obtener productos no vendidos:", error);
    return null;
  }
};

// 7) Reporte de carritos abandonados
export const getAbandonedCarts = async (): Promise<AbandonedCart[] | null> => {
  try {
    const { data } = await axios.get<AbandonedCart[]>(
      `${API_URL}/api/reports/carritos-abandonados`
    );
    return data;
  } catch (error) {
    console.error("Error al obtener carritos abandonados:", error);
    return null;
  }
};
