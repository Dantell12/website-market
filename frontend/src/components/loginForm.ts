import { loginUsuario } from "../services/user.service";

export function LoginForm(onLogin: (rol: string) => void) {
  const div = document.createElement("div");
  div.className = "h-screen flex items-center justify-center bg-gray-100";

  div.innerHTML = `
    <form class="bg-white p-6 rounded shadow-md w-80 space-y-4">
      <h2 class="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h2>
      <input type="email" name="email" placeholder="Correo electrónico" autocomplete="email"
             required class="w-full px-3 py-2 border rounded" />
      <input type="password" name="password" placeholder="Contraseña" autocomplete="current-password"
             required class="w-full px-3 py-2 border rounded" />
      <button type="submit"
              class="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded font-semibold">
        Ingresar
      </button>
      <button id="btn-register" type="button"
              class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-semibold">
        Registrarse
      </button>
    </form>
  `;

  const form = div.querySelector("form")!;
  const btnRegister = div.querySelector("#btn-register") as HTMLButtonElement;

  // Al hacer clic en "Registrarse", vamos a la ruta #/register
  btnRegister.addEventListener("click", () => {
    window.location.hash = "#/register";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;

    const result = await loginUsuario(email, password);

        // ...existing code...
        if (result?.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("rol", result.user.rol);
      localStorage.setItem("id", result.user.id);
      localStorage.setItem("email", result.user.email);

      // Si es cliente, guarda los datos de cliente en localStorage (opcional)
      if (result.user.rol === "cliente" && result.user.cliente) {
        // Puedes guardar los datos de cliente como string JSON si los necesitas luego
        localStorage.setItem("cliente", JSON.stringify(result.user.cliente));
      }

      onLogin(result.user.rol);
    } else {
      alert("Credenciales incorrectas");
    }
  });

  return div;
}