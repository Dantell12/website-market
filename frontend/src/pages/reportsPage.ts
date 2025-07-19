// src/pages/ReportsPage.ts
// ...arriba del todo...
let chartIncomeSeason: Chart | null = null;
let chartProductStatus: Chart | null = null;

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

     <!-- Grid de 3 columnas para estas secciones -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
  <!-- Productos No Vendidos -->
  <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
    <div class="p-6 bg-indigo-50 flex items-start gap-4 border-b border-indigo-100">
      <div class="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors">
        <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="13" rx="4" stroke="currentColor" />
          <rect x="7" y="3" width="2" height="4" rx="1" fill="currentColor" />
          <rect x="15" y="3" width="2" height="4" rx="1" fill="currentColor" />
        </svg>
      </div>
      <div>
        <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Reporte</span>
        <h3 class="text-xl font-bold text-gray-800 mt-1">Productos No Vendidos</h3>
      </div>
    </div>
    <div class="p-6">
      <ul id="unsold-products-list" class="space-y-3"></ul>
    </div>
  </div>

  <!-- Clientes Frecuentes -->
  <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
    <div class="p-6 bg-pink-50 flex items-start gap-4 border-b border-pink-100">
      <div class="bg-pink-100 p-3 rounded-lg group-hover:bg-pink-200 transition-colors">
        <svg class="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" stroke="currentColor" />
          <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" />
        </svg>
      </div>
      <div>
        <span class="text-xs font-semibold text-pink-600 uppercase tracking-wider">Reporte</span>
        <h3 class="text-xl font-bold text-gray-800 mt-1">Clientes Frecuentes</h3>
      </div>
    </div>
    <div class="p-6">
      <ul id="frequent-customers-list" class="space-y-3"></ul>
    </div>
  </div>

  <!-- Carritos Abandonados -->
  <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
    <div class="p-6 bg-green-50 flex items-start gap-4 border-b border-green-100">
      <div class="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M6 6h15l-1.5 9h-13z" stroke="currentColor" />
          <circle cx="9" cy="20" r="1.5" fill="currentColor" />
          <circle cx="18" cy="20" r="1.5" fill="currentColor" />
          <path d="M6 6L5 2H2" stroke="currentColor" />
        </svg>
      </div>
      <div>
        <span class="text-xs font-semibold text-green-600 uppercase tracking-wider">Reporte</span>
        <h3 class="text-xl font-bold text-gray-800 mt-1">Carritos Abandonados</h3>
      </div>
    </div>
    <div class="p-6">
      <ul id="abandoned-carts-list" class="space-y-3"></ul>
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

  // DESTRUIR GRÁFICO ANTERIOR SI EXISTE
  if (chartIncomeSeason) {
    chartIncomeSeason.destroy();
  }
  chartIncomeSeason = new Chart(ctx1, {
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
  if (chartProductStatus) {
    chartProductStatus.destroy();
  }
  chartProductStatus = new Chart(ctx2, {
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
              `<li class="bg-white/70 rounded-lg p-3 shadow flex flex-col">
                <span class="font-semibold">${p.nombre}</span>
                <span class="text-sm text-gray-500">${p.categoria}</span>
                <span class="text-sm">Stock: ${p.stock}</span>
              </li>`
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
            return `<li class="bg-white/70 rounded-lg p-3 shadow flex flex-col">
              <span class="font-semibold">${nombreCompleto}</span>
              <span class="text-sm">Compras: ${fc.cantidadVentas}</span>
            </li>`;
          })
          .join("");

  // 7) Carritos Abandonados
  const abandonedList = document.getElementById("abandoned-carts-list")!;
  const abandoned = (await getAbandonedCarts()) || [];
    abandonedList.innerHTML =
    abandoned.length === 0
      ? `<li class="text-gray-500">No hay carritos abandonados.</li>`
      : abandoned
          .map((ac: AbandonedCart, idx: number) => {
            const cliente = ac.cliente;
            const nombreCompleto = cliente
              ? `${cliente.nombre} ${cliente.apellido}`
              : "Cliente desconocido";
            const fecha = new Date(ac.fecha).toISOString().split("T")[0];
            return `<li class="bg-white/70 rounded-lg p-3 shadow flex flex-col">
              <span class="font-semibold text-green-700">Carrito #${idx + 1}</span>
              <span class="text-sm">${nombreCompleto}</span>
              <span class="text-sm text-gray-500">Fecha: ${fecha}</span>
            </li>`;
          })
          .join("");
}
