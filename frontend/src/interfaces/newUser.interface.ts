export interface newUserInterface {
  id_usuario: number;
  email: string;
  password: string;
  rol: string;
  nombre: string;
  apellido: string;
  cedula: string;
  direccion?: string | null;
}
