// src/components/navbar.ts

import { getUserRole } from "../authHelper";

export function Navbar() {
  const rol = getUserRole();

  // Definimos dos estilos base: uno para admin y otro para cliente
  const baseClasses = rol === "admin"
    ? "bg-green-700 text-white"                                   // Admin: fondo verde, texto blanco
    : "bg-white text-gray-800 border-b border-gray-300 shadow-md"; // Cliente: fondo blanco, texto negro

  // Items de menú según rol
  const menuItemsAdmin = `
    <li><a href="#/admin/productos" class="hover:underline">Adm Productos</a></li>
    <li><a href="#/admin/clientes" class="hover:underline">Adm Clientes</a></li>
    <li><a href="#/admin/ventas" class="hover:underline">Adm Ventas</a></li>
    <li><a href="#/admin/carrito" class="hover:underline">Adm Carrito</a></li>
    <li><a href="#/admin/reportes" class="hover:underline">Reportes</a></li>
  `;

  const menuItemsCliente = `
    <li><a href="#/tienda" class="hover:text-gray-600">Tienda</a></li>
    <li><a href="#/carrito" class="hover:text-gray-600">Carrito</a></li>
    <li><a href="#/purchases" class="hover:text-gray-600">Compras</a></li>
  `;

  const nav = document.createElement("nav");
  nav.className = `${baseClasses} px-6 py-4 flex justify-between items-center`;

  // Título o logo
  const titleHTML = rol === "admin"
    ? `<div class="text-xl font-bold">Panel Admin</div>`
    : `<div class="flex items-center gap-2">
         <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/Logo_nike_principal.jpg" alt="Logo Tienda" class="w-8 h-8"/> 
         <span class="text-2xl font-bold">ShoeStore</span>
       </div>`;

  // Construcción final del HTML
  nav.innerHTML = `
    ${titleHTML}
    <ul class="flex gap-6 font-semibold ${rol === "cliente" ? "" : ""}">
      ${rol === "admin" ? menuItemsAdmin : menuItemsCliente}
      <li><a href="#/login" class="${
        rol === "admin" ? "hover:text-red-300" : "hover:text-red-500"
      }" id="logout">Cerrar Sesión</a></li>
    </ul>
  `;

  // Logout
  nav.querySelector("#logout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.hash = "#/login";
  });

  return nav;
}
