import { LoginForm } from "../components/loginForm";

export function LoginPage(containerId: string) {
  const root = document.getElementById(containerId)!;
  root.innerHTML = "";

  root.appendChild(
    LoginForm((rol: string) => {
      if (rol === "admin") {
        window.location.hash = "#/admin";
      } else {
        window.location.hash = "#/tienda"; // <-- aquí
      }
    })
  );
}
