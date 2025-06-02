import axios from "axios";
import type { userInterface } from "../interfaces/user.interface";
import type { newUserInterface } from "../interfaces/newUser.interface";

const API_URL = "http://localhost:1880/api/users";
export interface LoginResponse {
  token: string;
  user: userInterface;
}
export const loginUsuario = async (
  email: string,
  password: string
): Promise<LoginResponse | null> => {
  try {
    const response = await axios.post("http://localhost:1880/api/users/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return null;
  }
};

export const registrarUsuario = async (
  usuario: newUserInterface
): Promise<boolean> => {
  try {
    await axios.post(`${API_URL}/`, usuario);
    return true;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return false;
  }
};
