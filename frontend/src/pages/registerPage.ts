// src/pages/RegisterPage.ts

import { RegisterForm } from "../components/registerForm";

export function RegisterPage(containerId: string) {
  const root = document.getElementById(containerId)!;
  root.innerHTML = "";
  root.appendChild(
    RegisterForm(() => {
      // Después de registrar, te llevamos al login
      window.location.hash = "#/login";
    })
  );
}
