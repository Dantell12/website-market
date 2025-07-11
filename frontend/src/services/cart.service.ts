// src/services/cart.service.ts
import api from "../axios.config";
import type { CartItemInterface } from "../interfaces/cart-item.interface";

const API_URL = "/cart";

// Agregar producto al carrito
export const addProductToCart = async (
  id_cliente: string,
  id_producto: string,
  cantidad: number
): Promise<{ success: boolean; msg: string }> => {
  try {
    const { data } = await api.post(`${API_URL}/agregar-producto`, {
      id_cliente,
      id_producto,
      cantidad,
    });
    return { success: true, msg: data.msg };
  } catch (error: any) {
    return { success: false, msg: error.response?.data?.msg ?? "Error" };
  }
};

// Listar productos del carrito
export const listCartProducts = async (): Promise<CartItemInterface[] | null> => {
  try {
    const id_cliente = localStorage.getItem("id");           // <-- string
    if (!id_cliente) throw new Error("Cliente no autenticado");

    const { data } = await api.get<CartItemInterface[]>(
      `${API_URL}/listar-productos/${id_cliente}`
    );
    return data;
  } catch (error) {
    console.error("Error al listar productos del carrito:", error);
    return null;
  }
};

// Eliminar producto
export const removeProductFromCart = async (
  id_cliente: string,
  id_producto: string
): Promise<boolean> => {
  try {
    await api.delete(`${API_URL}/eliminar-productos/${id_cliente}/${id_producto}`);
    return true;
  } catch {
    return false;
  }
};

// Actualizar cantidad
export const updateCartProduct = async (
  id_cliente: string,
  id_producto: string,
  cantidad: number
): Promise<boolean> => {
  try {
    await api.put(
      `${API_URL}/update-productos/${id_cliente}/${id_producto}/${cantidad}`
    );
    return true;
  } catch {
    return false;
  }
};
