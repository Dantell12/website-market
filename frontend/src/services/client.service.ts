// services/clients.service.ts
import api from "../axios.config";
import type { ClientInterface, UpdateClientPayload } from "../interfaces/client.interface";

const API_URL = "http://localhost:1880/api/clients";

export const getAllClients = async (): Promise<ClientInterface[]|null> => {
  try {
    const { data } = await api.get<ClientInterface[]>(API_URL);
    return data;
  } catch {
    return null;
  }
};

export const getClientById = async (id: string): Promise<ClientInterface|null> => {
  try {
    const { data } = await api.get<ClientInterface>(`${API_URL}/${id}`);
    return data;
  } catch {
    return null;
  }
};

// En lugar de createClient, ahora actualizas el subdocumento cliente:
export const updateClient = async (
  id: string,
  payload: UpdateClientPayload
): Promise<ClientInterface|null> => {
  try {
    const { data } = await api.put<ClientInterface>(
      `${API_URL}/${id}`,
      payload
    );
    return data;
  } catch {
    return null;
  }
};

export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`${API_URL}/${id}`);
    return true;
  } catch {
    return false;
  }
};
