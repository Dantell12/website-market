// services/users.service.ts
import axios from "axios";
import type { LoginResponse } from "../interfaces/user.interface";
import type { NewUserInterface } from "../interfaces/newUser.interface";

const BASE = "http://localhost:1880/api/users";

export const loginUsuario = async (
  email: string,
  password: string
): Promise<LoginResponse | null> => {
  try {
    const { data } = await axios.post<LoginResponse>(`${BASE}/login`, {
      email,
      password,
    });
    return data;
  } catch {
    return null;
  }
};

export const registrarUsuario = async (
  usuario: NewUserInterface
): Promise<boolean> => {
  try {
    await axios.post(`${BASE}/register`, usuario);
    return true;
  } catch {
    return false;
  }
};
