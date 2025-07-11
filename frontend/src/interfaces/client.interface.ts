// src/interfaces/cliente.interface.ts

export interface ClienteData {
  nombre:   string;
  apellido: string;
  cedula:   string;
  direccion?: string;
}

// Lo que devuelve GET /api/clients/:id
export interface ClientInterface {
  _id:     string;      // _id del Usuario
  email:   string;
  cliente: ClienteData;
}

// Para la llamada PUT /api/clients/:id
export type UpdateClientPayload = Partial<ClienteData>;
