// src/interfaces/newUser.interface.ts
// Lo que envías al registrar un usuario
export interface NewUserInterface {
  email:     string;
  password:  string;
  nombre:    string;      // datos de cliente
  apellido:  string;
  cedula:    string;
  direccion?: string;
}
