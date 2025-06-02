export interface ClientInterface {
  id_cliente: number;
  nombre: string;
  apellido: string;
  cedula: string;
  direccion?: string | null;
  id_usuario?: number | null;
}
