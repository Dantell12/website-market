// src/services/client.service.ts

import api from "../axios.config";
import type { ClientInterface, UpdateClientPayload } from "../interfaces/client.interface";

// Nuevo tipo para creación de cliente completo
interface CreateClientPayload {
  email: string;
  password: string;
  cliente: {
    nombre: string;
    apellido: string;
    cedula: string;
    direccion?: string;
  };
}

const API_URL = "http://localhost:1880/api/clients";

// Obtener todos los clientes
export const getAllClients = async (): Promise<ClientInterface[] | null> => {
  try {
    const { data } = await api.get<ClientInterface[]>(API_URL);
    return data;
  } catch {
    return null;
  }
};

// Obtener un cliente por ID
export const getClientById = async (id: string): Promise<ClientInterface | null> => {
  try {
    const { data } = await api.get<ClientInterface>(`${API_URL}/${id}`);
    return data;
  } catch {
    return null;
  }
};

// ✅ Crear un nuevo cliente (usuario + cliente)
export const createClient = async (
  payload: CreateClientPayload
): Promise<ClientInterface | null> => {
  try {
    const { data } = await api.post<ClientInterface>(API_URL, payload);
    return data;
  } catch (err) {
    console.error("Error en createClient:", err);
    return null;
  }
};

// Actualizar un cliente existente
export const updateClient = async (
  id: string,
  payload: UpdateClientPayload
): Promise<ClientInterface | null> => {
  try {
    const { data } = await api.put<ClientInterface>(`${API_URL}/${id}`, payload);
    return data;
  } catch {
    return null;
  }
};

// Eliminar un cliente
export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`${API_URL}/${id}`);
    return true;
  } catch {
    return false;
  }
};
