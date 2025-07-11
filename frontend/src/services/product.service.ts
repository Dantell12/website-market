import type { ProductInterface, Temporada } from "../interfaces/product.interface";
import api from "../axios.config";


const API_URL = "/products";

export const getAllProducts = async (): Promise<ProductInterface[] | null> => {
  try {
    const { data } = await api.get<ProductInterface[]>(API_URL);
    return data;
  } catch (error) {
    console.error("Error al listar productos:", error);
    return null;
  }
};

export const getProductById = async (
  id: string
): Promise<ProductInterface | null> => {
  try {
    const { data } = await api.get<ProductInterface>(`${API_URL}/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener producto ${id}:`, error);
    return null;
  }
};

export interface CreateProductDTO {
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  temporada: Temporada;
  img: string;
}

export const createProduct = async (
  product: CreateProductDTO
): Promise<ProductInterface | null> => {
  try {
    const { data } = await api.post<ProductInterface>(API_URL, product);
    return data;
  } catch (error) {
    console.error("Error al crear producto:", error);
    return null;
  }
};

export const updateProduct = async (
  id: string,
  product: Partial<CreateProductDTO>
): Promise<ProductInterface | null> => {
  try {
    const { data } = await api.put<ProductInterface>(
      `${API_URL}/${id}`,
      product
    );
    return data;
  } catch (error) {
    console.error(`Error al actualizar producto ${id}:`, error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar producto ${id}:`, error);
    return false;
  }
};