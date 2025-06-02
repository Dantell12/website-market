// src/components/RegisterForm.ts
import { registrarUsuario } from "../services/user.service";
import type { newUserInterface } from "../interfaces/newUser.interface";

export function RegisterForm(onSuccess: () => void) {
  const div = document.createElement("div");
  div.className = "h-screen flex items-center justify-center bg-gray-100";

  div.innerHTML = `
    <form class="bg-white p-6 rounded shadow-md w-96 space-y-4">
      <h2 class="text-2xl font-bold text-center text-gray-800">Registrar Usuario</h2>
      
      <input type="text" name="nombre" placeholder="Nombre"
             required class="w-full px-3 py-2 border rounded" />
             
      <input type="text" name="apellido" placeholder="Apellido"
             required class="w-full px-3 py-2 border rounded" />
             
      <input type="email" name="email" placeholder="Correo electrónico"
             required class="w-full px-3 py-2 border rounded" />
             
      <input type="text" name="cedula" placeholder="Cédula"
             required class="w-full px-3 py-2 border rounded" />
             
      <input type="text" name="direccion" placeholder="Dirección"
             class="w-full px-3 py-2 border rounded" />
             
      <input type="password" name="password" placeholder="Contraseña"
             required class="w-full px-3 py-2 border rounded" />
             
      <button type="submit"
              class="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded font-semibold">
        Registrar
      </button>
      
      <p id="register-error" class="text-red-500 text-sm hidden text-center">Error al registrar usuario</p>
      <p id="register-success" class="text-green-600 text-sm hidden text-center">Usuario registrado con éxito</p>
    </form>
  `;

  const form = div.querySelector("form")!;
  const errorMsg = div.querySelector("#register-error") as HTMLParagraphElement;
  const successMsg = div.querySelector("#register-success") as HTMLParagraphElement;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.classList.add("hidden");
    successMsg.classList.add("hidden");

    const nombre    = (form.nombre    as HTMLInputElement).value.trim();
    const apellido  = (form.apellido  as HTMLInputElement).value.trim();
    const email     = (form.email     as HTMLInputElement).value.trim();
    const cedula    = (form.cedula    as HTMLInputElement).value.trim();
    const direccion = (form.direccion as HTMLInputElement).value.trim();
    const password  = (form.password  as HTMLInputElement).value;

    const newUser: newUserInterface = {
      id_usuario: 0,       // backend ignora o autoincrementa
      email,
      password,
      rol: "cliente",      // siempre cliente al registrarse
      nombre,
      apellido,
      cedula,
      direccion,
    };

    const ok = await registrarUsuario(newUser);
    if (ok) {
      successMsg.classList.remove("hidden");
      setTimeout(() => {
        onSuccess(); // por ejemplo, redirigir a "#/login"
      }, 1500);
    } else {
      errorMsg.classList.remove("hidden");
    }
  });

  return div;
}
