// src/pages/AdminSalesPage.ts

import { getAllSalesAdmin, getSalesByClient } from "../services/sales.service";
import type {
  SaleInterface,
  SaleDetailInterface,
} from "../interfaces/sale.interface";
import type { ClientInterface } from "../interfaces/client.interface";
import type { ClientSaleResponse } from "../interfaces/client-sale-response";
// @ts-ignore: Librería sin tipos definidos
import html2pdf from "html2pdf.js";
import { getAllClients } from "../services/client.service";
import { Navbar } from "../components/navbar";

export async function AdminSalesPage(containerId: string) {
  const root = document.getElementById(containerId)!;
  root.innerHTML = "";
  root.appendChild(Navbar());

  // Estructura básica del contenedor
  root.innerHTML += /* html */ `
    <div class="p-6 space-y-6">
      <h2 class="text-3xl font-bold text-gray-800 mb-4">Administrador de Ventas</h2>

      <!-- Filtro por cliente -->
      <div class="flex items-center gap-4 mb-6">
        <label for="client-filter" class="font-semibold">Filtrar por Cliente:</label>
        <select id="client-filter" class="border px-3 py-2 rounded">
          <option value="-1">Todas las ventas</option>
        </select>
      </div>

      <!-- Lista de ventas -->
      <div id="sales-list" class="space-y-4"></div>
    </div>
  `;

  const filterSelect = root.querySelector<HTMLSelectElement>("#client-filter")!;
  const listContainer = root.querySelector<HTMLDivElement>("#sales-list")!;

  // Genera el HTML de la factura
  function generateInvoiceHTML(
    sale: SaleInterface,
    client: ClientInterface
  ): string {
    const date = new Date(sale.fecha).toLocaleString();

    return `
      <div id="invoice-content" class="p-8 mb-6">
        <div class="mb-8 text-center">
          <h2 class="text-3xl font-bold">Tienda Virtual Ecuador S.A.</h2>
          <p>RUC: 0999999999001</p>
          <p>Razón Social: Tienda Virtual Ecuador Sociedad Anónima</p>
          <p>Sucursal: Quito Norte</p>
          <p>Dirección Matriz: Av. Amazonas y Colón, Edificio Torre Azul, Quito - Ecuador</p>
        </div>
        <div class="mb-6">
          <h2 class="text-2xl font-bold mb-1">Factura #${sale.id_venta}</h2>
          <p class="text-sm text-gray-600">Fecha de emisión: ${date}</p>
        </div>
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-1">Cliente</h3>
          <p>Nombre: ${client.nombre} ${client.apellido}</p>
          <p>DNI/RUC: ${client.cedula}</p>
          <p>Dirección: ${client.direccion}</p>
        </div>
        <table class="w-full text-sm text-left text-gray-700 mb-6 border border-gray-300">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 border-b">Producto</th>
              <th class="px-4 py-2 border-b text-center">Cantidad</th>
              <th class="px-4 py-2 border-b text-right">Precio Unitario</th>
              <th class="px-4 py-2 border-b text-right">Impuesto</th>
              <th class="px-4 py-2 border-b text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${sale.detalles
              .map(
                (d: SaleDetailInterface) => `
              <tr class="border-b border-gray-200">
                <td class="px-4 py-2">${d.producto?.nombre || "N/D"}</td>
                <td class="px-4 py-2 text-center">${d.cantidad}</td>
                <td class="px-4 py-2 text-right">$${d.precio_unitario}</td>
                <td class="px-4 py-2 text-right">$${d.impuesto}</td>
                <td class="px-4 py-2 text-right">$${d.subtotal}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="text-right space-y-1">
          <p><strong>Subtotal:</strong> $${sale.subtotal}</p>
          <p><strong>Impuestos:</strong> $${sale.impuestos}</p>
          <p class="text-xl font-bold mt-2">Total: $${sale.total}</p>
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

    // Generar contenido de factura
    modal.innerHTML = generateInvoiceHTML(sale, client);

    // Botón cerrar
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Cerrar";
    closeBtn.className = "mt-6 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded";
    closeBtn.addEventListener("click", () => overlay.remove());

    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // Descargar factura como PDF
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

  // Cargar lista de clientes en el combo
  async function loadClients() {
    const clients = (await getAllClients()) || [];

    // Ya existe la opción “Todas las ventas” con value="-1" en el HTML inicial,
    // así que solo agregamos los clientes reales a continuación:
    clients.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id_cliente.toString();
      opt.textContent = `${c.nombre} ${c.apellido}`;
      filterSelect.appendChild(opt);
    });
  }

  // Evento para recargar ventas cuando cambia el filtro
  filterSelect.addEventListener("change", () => {
    const val = filterSelect.value;
    const clientId = parseInt(val, 10);
    if (isNaN(clientId) || clientId === -1) {
      loadSales();
    } else {
      loadSales(clientId);
    }
  });

  // Cargar ventas (por cliente o todas)
  async function loadSales(clientId?: number) {
    listContainer.innerHTML = `<p class="text-gray-600">Cargando ventas...</p>`;

    // Este objeto contendrá o bien {ventas de un cliente, cliente}, o bien {ventas todas, cliente=undefined}
    let response:
      | ClientSaleResponse
      | { ventas: SaleInterface[]; cliente: ClientInterface } = {
      ventas: [],
      cliente: undefined as any,
    };

    if (clientId != null && clientId !== -1) {
      // ventas de un cliente específico
      response = (await getSalesByClient(clientId)) || {
        ventas: [],
        cliente: undefined as any,
      };
    } else {
      // “Todas las ventas”: getAllSalesAdmin() devuelve un array de objetos
      const all = (await getAllSalesAdmin()) || [];

      // Reconstruimos un listado de SaleInterface[] sin la parte client
      const ventas: SaleInterface[] = all.map((v: any) => ({
        id_venta: v.id_venta,
        fecha: v.fecha,
        subtotal: v.subtotal,
        impuestos: v.impuestos,
        total: v.total,
        detalles: v.detalles.map((d: any) => ({
          id_detalle_venta: d.id_detalle_venta,
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          impuesto: d.impuesto,
          subtotal: d.subtotal,
          producto: d.producto || null,
        })),
      }));

      // Aquí el cliente no aplica, porque abarca todas las ventas
      response = { ventas, cliente: undefined as any };

      // Guardamos `all` en un scope superior para buscar más abajo
      allVentas = all;
    }

    listContainer.innerHTML = "";

    if (!response.ventas.length) {
      listContainer.innerHTML = `<p class="text-gray-500">No hay ventas para mostrar.</p>`;
      return;
    }

    response.ventas.forEach((sale: SaleInterface) => {
      const date = new Date(sale.fecha).toLocaleDateString();
      const div = document.createElement("div");
      div.className =
        "bg-white shadow rounded p-4 flex justify-between items-center";

      // Si estamos mostrando “todas las ventas”, buscamos el cliente correspondiente en allVentas
      let clienteInfoHTML = "";
      if (!clientId || clientId === -1) {
        // `allVentas` es la lista original que contiene { cliente: {...} }
        const registro = allVentas.find((v) => v.id_venta === sale.id_venta);
        if (registro && registro.cliente) {
          const cli = registro.cliente as ClientInterface;
          clienteInfoHTML = `<p class="text-sm text-gray-600">
              Cliente: ${cli.nombre} ${cli.apellido}
            </p>`;
        }
      }

      div.innerHTML = /* html */ `
        <div>
          <p class="font-semibold">#${sale.id_venta} — ${date}</p>
          <p class="text-gray-600">Total: $${sale.total}</p>
          ${clienteInfoHTML}
        </div>
        <div class="flex gap-2">
          <button class="download-pdf px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
            Descargar PDF
          </button>
          <button class="view-invoice px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
            Ver factura
          </button>
        </div>
      `;

      // Botón “Descargar PDF”
      const downloadBtn = div.querySelector(".download-pdf")!;
      downloadBtn.addEventListener("click", () => {
        let cli: ClientInterface | undefined;
        if (clientId != null && clientId !== -1) {
          // caso “ventas por cliente específico”
          cli = (response as ClientSaleResponse).cliente;
        } else {
          // caso “todas las ventas”: buscamos en allVentas
          const registro = allVentas.find((v) => v.id_venta === sale.id_venta);
          cli = registro?.cliente;
        }
        if (cli) {
          downloadInvoice(sale, cli);
        }
      });

      // Botón “Ver factura”
      const viewBtn = div.querySelector(".view-invoice")!;
      viewBtn.addEventListener("click", () => {
        let cli: ClientInterface | undefined;
        if (clientId != null && clientId !== -1) {
          cli = (response as ClientSaleResponse).cliente;
        } else {
          const registro = allVentas.find((v) => v.id_venta === sale.id_venta);
          cli = registro?.cliente;
        }
        if (cli) {
          showInvoice(sale, cli);
        }
      });

      listContainer.appendChild(div);
    });
  }

  // Variable en scope superior donde guardamos “allVentas”
  let allVentas: any[] = [];

  // Cargamos los clientes en el select
  await loadClients();

  // Obtenemos todas las ventas inicialmente y renderizamos
  allVentas = (await getAllSalesAdmin()) || [];
  loadSales();
}
