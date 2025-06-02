import { LoginPage } from "./pages/loginPage";
// importa más páginas según necesites…

import {
  isAuthenticated,
  getToken,
  getUserRole,
  isTokenExpired,
} from "./authHelper";
import { RegisterPage } from "./pages/registerPage";
import { ReportsPage } from "./pages/reportsPage";
import { AdminSalesPage } from "./pages/adminSalesPage";

export function router() {
  const appId = "app";
  let route = window.location.hash || "#/login";

  // 1) Si había token pero expiró: limpiar y forzar login
  const token = getToken();
  if (token && isTokenExpired(token)) {
    localStorage.clear();
    window.location.hash = "#/login";
    return;
  }

  // 2) Rutas públicas
  // ahora:
  const publicRoutes = ["#/login", "#/register"];
  if (!isAuthenticated() && !publicRoutes.includes(route)) {
    window.location.hash = "#/login";
    return;
  }

  // 3) Rutas protegidas
  switch (route) {
    case "#/login":
      LoginPage(appId);
      break;
    case "#/register":
      RegisterPage(appId);
      break;
    case "#/admin":
      // Sólo admin
      if (getUserRole() !== "admin") {
        window.location.hash = "#/login";
        return;
      }
      ReportsPage(appId);
      break;
    case "#/admin/productos":
      if (getUserRole() !== "admin") {
        window.location.hash = "#/login";
        return;
      }
      import("./pages/productPage").then(({ AdminProductosPage }) => {
        AdminProductosPage(appId);
      });
      break;
    case "#/admin/clientes":
      if (getUserRole() !== "admin") {
        window.location.hash = "#/login";
        return;
      }
      import("./pages/clientPage").then(({ AdminClientesPage }) => {
        AdminClientesPage(appId);
      });
      break;
    case "#/tienda":
      import("./pages/storePage").then(({ StorePage }) => {
        StorePage(appId);
      });
      break;

    case "#/carrito":
      if (getUserRole() !== "cliente") {
        window.location.hash = "#/tienda"; // o redirige a otra parte
        return;
      }
      import("./pages/cartPage").then(({ CartPage }) => {
        CartPage(appId);
      });
      break;
    case "#/purchases":
      if (getUserRole() !== "cliente") {
        window.location.hash = "#/tienda"; // o redirige a otra parte
        return;
      }
      import("./pages/purchasesPage").then(({ PurchasesPage }) => {
        PurchasesPage(appId);
      });
      break;
    case "#/admin/reportes":
      if (getUserRole() !== "admin") {
        window.location.hash = "#/login";
        return;
      }
      ReportsPage(appId);
      break;
    case "#/admin/ventas":
      if (getUserRole() !== "admin") {
        window.location.hash = "#/login";
        return;
      }
      AdminSalesPage(appId);
      break;
    default:
      document.getElementById(appId)!.innerHTML =
        "<h2>Página no encontrada</h2>";
  }
}

// Inicializa el router
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
