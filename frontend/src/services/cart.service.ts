// src/services/cart.service.ts
import api from "../axios.config";

export const addProductToCart = async (id_cliente: string, productId: string, quantity: number) => {
  if (!id_cliente) throw new Error('Usuario no autenticado');

  try {
    const { data } = await api.post("/cart/agregar-producto", {
      id_cliente,
      id_producto: productId,
      cantidad: quantity
    });
    return data;
  } catch (error) {
    console.error('Error al agregar producto:', error);
    throw error;
  }
};

export const listCartProducts = async () => {
  const id_cliente = localStorage.getItem('id'); // <-- Cambia aquí
  if (!id_cliente) throw new Error('Usuario no autenticado');

  try {
    const { data } = await api.get(`/cart/listar-productos/${id_cliente}`);
    return data;
  } catch (error) {
    console.error('Error al listar productos:', error);
    throw error;
  }
};

export const removeProductFromCart = async (productId: string): Promise<boolean> => {
  const id_cliente = localStorage.getItem('id'); // <-- Cambia aquí
  if (!id_cliente) throw new Error('Usuario no autenticado');

  try {
    await api.delete(`/cart/eliminar-productos/${id_cliente}/${productId}`);
    return true;
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return false;
  }
};

export const updateCartProduct = async (productId: string, quantity: number): Promise<boolean> => {
  const id_cliente = localStorage.getItem('id'); // <-- Cambia aquí
  if (!id_cliente) throw new Error('Usuario no autenticado');

  try {
    await api.put(`/cart/update-productos/${id_cliente}/${productId}/${quantity}`);
    return true;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return false;
  }
};
