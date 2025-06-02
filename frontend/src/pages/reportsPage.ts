// src/pages/ReportsPage.ts
import { Navbar } from "../components/navbar";
import type {
  IncomeBySeason,
  ProductReport,
  UnsoldProduct,
  FrequentCustomer,
  AbandonedCart,
} from "../interfaces/reports.interface";
import {
  getTotalRevenue,
  getIncomeBySeason,
  getProductReport,
  getUnsoldProducts,
  getFrequentCustomers,
  getAbandonedCarts,
} from "../services/report.service";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export async function ReportsPage(containerId: string) {
  const root = document.getElementById(containerId)!;
  root.innerHTML = "";
  root.appendChild(Navbar());

  // Estructura HTML principal
  const html = `
    <div class="p-6 space-y-8">
      <h2 class="text-3xl font-bold text-gray-800">Dashboard de Reportes</h2>

      <!-- Total Vendido -->
      <div id="total-revenue" class="bg-white rounded-lg shadow p-4">
        <h3 class="text-xl font-semibold mb-2">Total Vendido</h3>
        <p id="total-revenue-value" class="text-2xl font-bold text-green-700">Cargando...</p>
      </div>

      <!-- Grid para Ingresos por Temporada y Estado de Stock -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Ingresos por Temporada -->
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-xl font-semibold mb-2">Ingresos por Temporada</h3>
          <canvas id="chart-income-season"></canvas>
        </div>

        <!-- Estado de Stock de Productos -->
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-xl font-semibold mb-2">Estado de Stock de Productos</h3>
<canvas
  id="chart-product-status"
  class="w-200 h-200 mx-auto"
/>        </div>
      </div>

      <!-- Tabla: Reporte de Productos (Estado, Descuento, Alerta de Stock) -->
      <div class="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <h3 class="text-xl font-semibold mb-2">Reporte de Productos</h3>
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-2 px-4">Nombre</th>
              <th class="py-2 px-4">Categoría</th>
              <th class="py-2 px-4">Estado</th>
              <th class="py-2 px-4">Descuento</th>
              <th class="py-2 px-4">Stock</th>
              <th class="py-2 px-4">Alerta</th>
            </tr>
          </thead>
          <tbody id="product-report-body" class="divide-y divide-gray-200">
            <tr><td colspan="6" class="py-2 px-4 text-gray-500">Cargando...</td></tr>
          </tbody>
        </table>
      </div>

     <!-- Grid de 3 columnas para estas secciones -->  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
   <!-- Productos No Vendidos -->
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="text-xl font-semibold mb-2">Productos No Vendidos</h3>
     <ul id="unsold-products-list" class="list-disc list-inside text-gray-700">Cargando...</ul>
    </div>

    <!-- Clientes Frecuentes -->
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="text-xl font-semibold mb-2">Clientes Frecuentes (Último Mes)</h3>
      <ul id="frequent-customers-list" class="list-disc list-inside text-gray-700">Cargando...</ul>
    </div>

    <!-- Carritos Abandonados -->
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="text-xl font-semibold mb-2">Carritos Abandonados</h3>
      <ul id="abandoned-carts-list" class="list-disc list-inside text-gray-700">Cargando...</ul>
   </div>
 </div>
    </div>
  `;
  root.innerHTML += html;

  // 1) Total Vendido
  const totalElem = document.getElementById("total-revenue-value")!;
  const totalVendido = await getTotalRevenue();
  totalElem.textContent =
    totalVendido !== null ? `$${totalVendido.toFixed(2)}` : "—";

  // 2) Gráfico Ingresos por Temporada
  const incomeData = (await getIncomeBySeason()) || [];
  const seasons = incomeData.map((i: IncomeBySeason) => i.temporada);
  const ingresos = incomeData.map((i: IncomeBySeason) =>
    parseFloat(String(i.ingresoTotal))
  );

  const ctx1 = (
    document.getElementById("chart-income-season") as HTMLCanvasElement
  ).getContext("2d")!;
  new Chart(ctx1, {
    type: "bar",
    data: {
      labels: seasons,
      datasets: [
        {
          label: "Ingresos",
          data: ingresos,
          backgroundColor: ["#4ade80", "#facc15", "#f87171"],
          borderRadius: 4,
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Monto ($)" } },
        x: { title: { display: true, text: "Temporada" } },
      },
      plugins: { legend: { display: false } },
    },
  });

  // 3) Gráfico Estado de Stock
  const productData = (await getProductReport()) || [];
  const estadosCount: Record<string, number> = {
    agotado: 0,
    mínimo: 0,
    disponible: 0,
  };
  productData.forEach((p: ProductReport) => {
    estadosCount[p.estado] = (estadosCount[p.estado] || 0) + 1;
  });
  const estadosLabels = Object.keys(estadosCount);
  const estadosValues = Object.values(estadosCount);

  const ctx2 = (
    document.getElementById("chart-product-status") as HTMLCanvasElement
  ).getContext("2d")!;
  new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: estadosLabels,
      datasets: [
        {
          data: estadosValues,
          backgroundColor: ["#ef4444", "#fbbf24", "#10b981"],
        },
      ],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });

  // 4) Tabla de productos con estado, descuento y alerta
  const tableBody = document.getElementById("product-report-body")!;
  tableBody.innerHTML =
    productData.length === 0
      ? `<tr><td colspan="6" class="py-2 px-4 text-gray-500">No hay productos registrados.</td></tr>`
      : productData
          .map((p: ProductReport) => {
            const alerta = p.stock < 5 ? "⚠️ Bajo stock" : "";
            return `
          <tr>
            <td class="py-2 px-4">${p.nombre}</td>
            <td class="py-2 px-4">${p.categoria}</td>
            <td class="py-2 px-4 capitalize">${p.estado}</td>
            <td class="py-2 px-4">${
              p.descuentoRate ? p.descuentoRate + "%" : "—"
            }</td>
            <td class="py-2 px-4">${p.stock}</td>
            <td class="py-2 px-4">${alerta}</td>
          </tr>
        `;
          })
          .join("");

  // 5) Productos No Vendidos
  const unsoldList = document.getElementById("unsold-products-list")!;
  const unsold = (await getUnsoldProducts()) || [];
  unsoldList.innerHTML =
    unsold.length === 0
      ? `<li class="text-gray-500">No hay productos sin ventas.</li>`
      : unsold
          .map(
            (p: UnsoldProduct) =>
              `<li>${p.nombre} (${p.categoria}) – Stock: ${p.stock}</li>`
          )
          .join("");

  // 6) Clientes Frecuentes
  const minCompras = 1;
  const frequentList = document.getElementById("frequent-customers-list")!;
  const frequent = (await getFrequentCustomers(minCompras)) || [];
  frequentList.innerHTML =
    frequent.length === 0
      ? `<li class="text-gray-500">No hay clientes con más de ${minCompras} compra(s) en el último mes.</li>`
      : frequent
          .map((fc: FrequentCustomer) => {
            const cliente = fc.cliente;
            const nombreCompleto = cliente
              ? `${cliente.nombre} ${cliente.apellido}`
              : "Cliente desconocido";
            return `<li>${nombreCompleto} – Compras: ${fc.cantidadVentas}</li>`;
          })
          .join("");

  // 7) Carritos Abandonados
  const abandonedList = document.getElementById("abandoned-carts-list")!;
  const abandoned = (await getAbandonedCarts()) || [];
  abandonedList.innerHTML =
    abandoned.length === 0
      ? `<li class="text-gray-500">No hay carritos abandonados.</li>`
      : abandoned
          .map((ac: AbandonedCart) => {
            const cliente = ac.cliente;
            const nombreCompleto = cliente
              ? `${cliente.nombre} ${cliente.apellido}`
              : "Cliente desconocido";
            const fecha = new Date(ac.fecha).toISOString().split("T")[0];
            return `<li>Carrito #${ac.id_carrito} – ${nombreCompleto} – Fecha: ${fecha}</li>`;
          })
          .join("");
}
