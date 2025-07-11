// src/interfaces/user.interface.ts

import type { ClienteData } from "./client.interface";

// Lo que devuelve /api/users/login
export interface UserInterface {
  id:      string;         // _id de Usuario
  email:   string;
  rol:     "admin" | "cliente";
  cliente?: ClienteData;   // sólo si rol === "cliente"
}
export interface LoginResponse {
  token: string;
  user:  UserInterface;
}
