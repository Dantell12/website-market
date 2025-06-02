import type { ClientInterface } from "../interfaces/client.interface";
import api from "../axios.config";    // <–– aquí importas la instancia

const API_URL = "http://localhost:1880/api/clients";

export const getAllClients = async (): Promise<ClientInterface[] | null> => {
  try {
    const { data } = await api.get<ClientInterface[]>(API_URL);
    return data;
  } catch (error) {
    console.error("Error al listar clientes:", error);
    return null;
  }
};

export const getClientById = async (
  id: number
): Promise<ClientInterface | null> => {
  try {
    const { data } = await api.get<ClientInterface>(`${API_URL}/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener cliente ${id}:`, error);
    return null;
  }
};

export const createClient = async (
  client: Omit<ClientInterface, "id_cliente">
): Promise<ClientInterface | null> => {
  try {
    const { data } = await api.post<ClientInterface>(API_URL, client);
    return data;
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return null;
  }
};

export const updateClient = async (
  id: number,
  client: Partial<Omit<ClientInterface, "id_cliente">>
): Promise<ClientInterface | null> => {
  try {
    const { data } = await api.put<ClientInterface>(
      `${API_URL}/${id}`,
      client
    );
    return data;
  } catch (error) {
    console.error(`Error al actualizar cliente ${id}:`, error);
    return null;
  }
};

export const deleteClient = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar cliente ${id}:`, error);
    return false;
  }
};
