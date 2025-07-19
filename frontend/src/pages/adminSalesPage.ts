// src/pages/AdminSalesPage.ts

import {getAllSalesAdmin, getSalesByClient } from "../services/sales.service";
import type { SaleInterface } from "../interfaces/sale.interface";
import type { ClientInterface } from "../interfaces/client.interface";
// @ts-ignore: Librería sin tipos definidos
import html2pdf from "html2pdf.js";
import { getAllClients } from "../services/client.service";
import { Navbar } from "../components/navbar";

export async function AdminSalesPage(containerId: string) {
  const root = document.getElementById(containerId)!;
  root.innerHTML = "";
  root.appendChild(Navbar());

  root.innerHTML += /* html */ `
    <div class="p-6 space-y-6">
      <h2 class="text-3xl font-bold text-gray-800 mb-4">Administrador de Ventas</h2>
      <div class="flex items-center gap-4 mb-6">
        <label for="client-filter" class="font-semibold">Filtrar por Cliente:</label>
        <select id="client-filter" class="border px-3 py-2 rounded">
          <option value="-1">Todas las ventas</option>
        </select>
      </div>
      <div id="sales-list" class="space-y-4"></div>
    </div>
  `;

  const filterSelect = root.querySelector<HTMLSelectElement>("#client-filter")!;
  const listContainer = root.querySelector<HTMLDivElement>("#sales-list")!;

        // ...existing imports...
    
    function extractCliente(obj: any): any {
      // Busca recursivamente un objeto con 'nombre', 'apellido', 'cedula'
      if (!obj) return null;
      if (typeof obj !== "object") return null;
      if (obj.nombre && obj.apellido && obj.cedula) return obj;
      if (obj.cliente) return extractCliente(obj.cliente);
      return null;
    }
    
 function generateInvoiceHTML(sale: SaleInterface, client: any): string {
  const date = new Date(sale.fecha).toLocaleString();
  const c = extractCliente(client) || {};

  // Soporte para 'detalle' y 'detalles'
  const detalles = Array.isArray((sale as any).detalles)
    ? (sale as any).detalles
    : Array.isArray(sale.detalle)
      ? sale.detalle
      : [];

    // Depuración: muestra la estructura completa de la venta
    console.log("Venta completa:", sale);
    console.log("Detalle de la venta:", detalles);

    // ...resto del código...

    return `
    <div id="invoice-content" class="p-8 mb-6">
          <!-- Datos de la empresa -->
          <div class="mb-8 text-center">
            <h2 class="text-3xl font-bold">Tienda Virtual Ecuador S.A.</h2>
            <p>RUC: 0999999999001</p>
            <p>Razón Social: Tienda Virtual Ecuador Sociedad Anónima</p>
            <p>Sucursal: Quito Norte</p>
            <p>Dirección Matriz: Av. Amazonas y Colón, Edificio Torre Azul, Quito - Ecuador</p>
          </div>
    
          <!-- Datos de la factura -->
          <div class="mb-6">
            <h2 class="text-2xl font-bold mb-1">Factura #${sale.id_venta || sale._id}</h2>
            <p class="text-sm text-gray-600">Fecha de emisión: ${date}</p>
          </div>
    
          <!-- Datos del cliente -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-1">Cliente</h3>
            <p>Nombre: ${c.nombre ? c.nombre : "N/D"} ${c.apellido ? c.apellido : ""}</p>
            <p>DNI/RUC: ${c.cedula ? c.cedula : "N/D"}</p>
            <p>Dirección: ${c.direccion ? c.direccion : "N/D"}</p>
          </div>
    
          <!-- Detalles de la venta -->
          <table class="w-full text-left border-collapse mt-8">
            <thead>
              <tr>
                <th class="border-b-2 p-2">Producto</th>
                <th class="border-b-2 p-2 text-right">Cantidad</th>
                <th class="border-b-2 p-2 text-right">Precio Unit.</th>
                <th class="border-b-2 p-2 text-right">Impuesto</th>
                <th class="border-b-2 p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${(Array.isArray(detalles) ? detalles : []).map(item => `
                <tr>
                  <td class="border-b p-2">${item.producto?.nombre || 'Producto no disponible'}</td>
                  <td class="border-b p-2 text-right">${item.cantidad ?? "N/D"}</td>
                  <td class="border-b p-2 text-right">$${item.precio_unitario?.toFixed(2) ?? "N/D"}</td>
                  <td class="border-b p-2 text-right">$${item.impuesto?.toFixed(2) ?? "N/D"}</td>
                  <td class="border-b p-2 text-right">$${item.subtotal?.toFixed(2) ?? "N/D"}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
    
          <!-- Totales -->
          <div class="flex justify-end mt-8">
            <div class="w-full max-w-xs">
              <div class="flex justify-between">
                <span class="font-semibold">Subtotal:</span>
                <span>$${sale.subtotal?.toFixed(2) ?? "N/D"}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-semibold">Impuestos:</span>
                <span>$${sale.impuestos?.toFixed(2) ?? "N/D"}</span>
              </div>
              <div class="flex justify-between font-bold text-lg border-t mt-2 pt-2">
                <span>Total:</span>
                <span>$${sale.total?.toFixed(2) ?? "N/D"}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

  function showInvoice(sale: SaleInterface, client: ClientInterface) {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    const modal = document.createElement("div");
    modal.className =
      "bg-white rounded-lg shadow-lg w-11/12 md:w-[90%] lg:w-[80%] max-h-[95vh] overflow-y-auto p-8";
    modal.setAttribute("id", "invoice-content");

    modal.innerHTML = generateInvoiceHTML(sale, client);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Cerrar";
    closeBtn.className = "mt-6 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded";
    closeBtn.addEventListener("click", () => overlay.remove());

    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  function downloadInvoice(sale: SaleInterface, client: ClientInterface) {
    const invoiceHtml = generateInvoiceHTML(sale, client);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = invoiceHtml;

    html2pdf()
      .from(tempDiv)
      .set({
        margin: 0.5,
        filename: `Factura_${sale.id_venta}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .save();
  }

    function getClientName(sale: any): string {
    if (sale.cliente?.cliente?.nombre) {
      return `${sale.cliente.cliente.nombre} ${sale.cliente.cliente.apellido}`;
    }
    if (sale.cliente?.nombre) {
      return `${sale.cliente.nombre} ${sale.cliente.apellido}`;
    }
    return 'N/A';
  }

  async function loadClients() {
    const clients = (await getAllClients()) || [];
    clients.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c._id;
      opt.textContent = `${c.cliente.nombre} ${c.cliente.apellido}`;
      filterSelect.appendChild(opt);
    });
  }

  filterSelect.addEventListener("change", () => {
    const clientId = filterSelect.value;
    if (clientId === "-1") {
      loadSales();
    } else {
      loadSales(clientId);
    }
  });

  async function loadSales(clientId?: string) {
    listContainer.innerHTML = `<p class="text-gray-600">Cargando ventas...</p>`;
    let sales: SaleInterface[] = [];

    if (clientId && clientId !== "-1") {
      // Vista filtrada por cliente
      const clientData = await getSalesByClient(clientId);
      if (clientData && clientData.ventas.length > 0) {
        // Adjuntamos la información del cliente a cada una de sus ventas
        sales = clientData.ventas.map(sale => ({
          ...sale,
          cliente: clientData.cliente, // ¡Esta es la corrección clave!
        }));
      }
    } else {
      // Vista de "Todas las ventas"
      const allSales = await getAllSalesAdmin();
      if (allSales) {
        // El backend ya adjunta la info del cliente en este endpoint
        sales = allSales;
      }
    }

    listContainer.innerHTML = "";

    if (!sales.length) {
      listContainer.innerHTML = `<p class="text-gray-500">No hay ventas para mostrar.</p>`;
      return;
    }

       sales.forEach((sale) => {
      const date = new Date(sale.fecha).toLocaleDateString();
      const div = document.createElement("div");
      div.className = "bg-white shadow rounded p-4 flex justify-between items-center";
    
      const clientName = getClientName(sale);
    
      div.innerHTML = `
        <div>
          <p class="font-semibold">#${sale.id_venta || sale._id} — ${date}</p>
          <p class="text-gray-600">Total: $${sale.total.toFixed(2)}</p>
          <p class="text-sm text-gray-600">Cliente: ${clientName}</p>
        </div>
        <div class="flex gap-2">
          <button class="download-pdf px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Descargar PDF</button>
          <button class="view-invoice px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">Ver factura</button>
        </div>
      `;

      const downloadBtn = div.querySelector<HTMLButtonElement>(".download-pdf")!;
      const viewBtn = div.querySelector<HTMLButtonElement>(".view-invoice")!;

      // Ahora los botones siempre tendrán la información del cliente
      if (sale.cliente) {
        downloadBtn.addEventListener("click", () => downloadInvoice(sale, sale.cliente!));
        viewBtn.addEventListener("click", () => showInvoice(sale, sale.cliente!));
      } else {
        downloadBtn.disabled = viewBtn.disabled = true;
      }
      listContainer.appendChild(div);
    });
  }

  await loadClients();
  await loadSales();
}
