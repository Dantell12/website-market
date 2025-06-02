import api from "../axios.config";
import type { CartItemInterface } from "../interfaces/cart-item.interface";

const API_URL = "http://localhost:1880/api/carts";

// Agregar producto al carrito
export const addProductToCart = async (
  id_cliente: number,
  id_producto: number,
  cantidad: number
): Promise<{ success: boolean; msg: string }> => {
  console.log(id_cliente);
  try {
    const { data } = await api.post(`${API_URL}/agregar-producto`, {
      id_cliente,
      id_producto,
      cantidad,
    });
    // data.msg es "Producto agregado al carrito"
    return { success: true, msg: data.msg };
  } catch (error: any) {
    const msg =
      error.response?.data?.msg || "Error al agregar producto al carrito.";
    return { success: false, msg };
  }
};

// Listar productos del carrito
export const listCartProducts = async (): Promise<
  CartItemInterface[] | null
> => {
  try {
    const id_cliente = Number(localStorage.getItem("id_cliente"));
    if (!id_cliente) {
      throw new Error("ID de cliente no encontrado en localStorage");
    }

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
  id_cliente: number,
  id_producto: number
): Promise<boolean> => {
  try {
    await api.delete(
      `${API_URL}/eliminar-productos/${id_cliente}/${id_producto}`
    );
    return true;
  } catch {
    console.error("Error al eliminar producto del carrito");
    return false;
  }
};

// Actualizar cantidad
export const updateCartProduct = async (
  id_cliente: number,
  id_producto: number,
  cantidad: number
): Promise<boolean> => {
  try {
    await api.put(
      `${API_URL}/update-productos/${id_cliente}/${id_producto}/${cantidad}`
    );
    return true;
  } catch {
    console.error("Error al actualizar producto en el carrito");
    return false;
  }
};
