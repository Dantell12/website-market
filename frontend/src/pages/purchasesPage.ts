// src/pages/purchasesPage.ts
import { Navbar } from "../components/navbar";
import { getSalesByClient } from "../services/sales.service";
import type { SaleInterface } from "../interfaces/sale.interface";
// @ts-ignore: Librería sin tipos definidos
import html2pdf from "html2pdf.js";
import type { ClienteData } from "../interfaces/client.interface";
import type { ClientSaleResponse } from "../interfaces/client-sale-response";

export function PurchasesPage(containerId: string) {
  const root = document.getElementById(containerId)!;
  root.innerHTML = "";
  root.appendChild(Navbar());

  root.innerHTML += /* html */ `
    <div class="p-6">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Mis Compras</h2>
      <div id="purchases-list" class="space-y-4"></div>
    </div>
  `;

  const listContainer = root.querySelector<HTMLElement>("#purchases-list")!;
  function generateInvoiceHTML(
    sale: SaleInterface,
    client: ClienteData
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
        <p>Dirección: ${client.direccion || "N/D"}</p>
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
          ${(sale.detalle ?? [])
            .map(
              (d) => `
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

  function showInvoice(
    sale: SaleInterface,
    client: ClienteData
  ) {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    const modal = document.createElement("div");
    modal.className =
      "bg-white rounded-lg shadow-lg w-11/12 md:w-[90%] lg:w-[80%] max-h-[95vh] overflow-y-auto p-8";

    modal.setAttribute("id", "invoice-content");

    const date = new Date(sale.fecha).toLocaleString();

    modal.innerHTML = `
        <!-- Datos de la tienda -->
        <div class="mb-8 text-center">
            <h2 class="text-3xl font-bold">Tienda Virtual Ecuador S.A.</h2>
            <p>RUC: 0999999999001</p>
            <p>Razón Social: Tienda Virtual Ecuador Sociedad Anónima</p>
            <p>Sucursal: Quito Norte</p>
            <p>Dirección Matriz: Av. Amazonas y Colón, Edificio Torre Azul, Quito - Ecuador</p>
        </div>

        <!-- Datos de la factura -->
        <div class="mb-6">
            <h2 class="text-2xl font-bold mb-1">Factura #${sale.id_venta}</h2>
            <p class="text-sm text-gray-600">Fecha de emisión: ${date}</p>
        </div>

        <!-- Datos del cliente -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-1">Cliente</h3>
           <p>Nombre: <span class="text-gray-700">${client.nombre} ${
      client.apellido
    }</span></p>
<p>DNI/RUC: <span class="text-gray-700">${client.cedula}</span></p>
<p>Dirección: <span class="text-gray-700">${
      client.direccion || "N/D"
    }</span></p>
        </div>

        <!-- Tabla de productos -->
        <table class="w-full text-sm text-left text-gray-700 mb-6 border border-gray-300">
            <thead class="bg-gray-100">
            <tr>
                <th class="px-4 py-2 border-b border-gray-300">Producto</th>
                <th class="px-4 py-2 border-b border-gray-300 text-center">Cantidad</th>
                <th class="px-4 py-2 border-b border-gray-300 text-right">Precio Unitario</th>
                <th class="px-4 py-2 border-b border-gray-300 text-right">Impuesto</th>
                <th class="px-4 py-2 border-b border-gray-300 text-right">Subtotal</th>
            </tr>
            </thead>
            <tbody>
              ${(sale.detalle ?? [])
                
                .map(
                  (d) => `
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

        <!-- Totales -->
        <div class="text-right space-y-1">
            <p><span class="font-semibold">Subtotal:</span> $${sale.subtotal}</p>
            <p><span class="font-semibold">Impuestos:</span> $${sale.impuestos}</p>
            <p class="text-xl font-bold mt-2">Total: $${sale.total}</p>
        </div>

        <!-- Botón cerrar -->
        <div class="mt-6 flex justify-end">
            <button id="close-invoice" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">Cerrar</button>
        </div>
        `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Botón cerrar
    overlay.querySelector("#close-invoice")!.addEventListener("click", () => {
      overlay.remove();
    });
  }

  // Carga inicial de compras
  (async () => {
    listContainer.innerHTML = `<p class="text-gray-600">Cargando compras...</p>`;
    const id_cliente = localStorage.getItem("id");

    if (!id_cliente) {
      listContainer.innerHTML = `<p class="text-red-500 text-center mt-6">Debes iniciar sesión para ver tus compras.</p>`;
      return;
    }

    

    const clientData: ClientSaleResponse | null = await getSalesByClient(
      id_cliente
    );

    if (!clientData || clientData.ventas.length === 0) {
      listContainer.innerHTML = `<p class="text-gray-500">No has realizado compras aún.</p>`;
      return;
    }

    listContainer.innerHTML = "";

    clientData.ventas.forEach((sale: SaleInterface) => {
      const date = new Date(sale.fecha).toLocaleDateString();
      const div = document.createElement("div");
      div.className = "bg-white shadow rounded p-4 flex justify-between items-center";

      div.innerHTML = /* html */ `
    <div>
      <p class="font-semibold">#${sale.id_venta} — ${date}</p>
      <p class="text-gray-600">Total: $${sale.total}</p>
    </div>
    <div class="flex gap-2">
      <button class="download-pdf px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Descargar PDF</button>
      <button class="view-invoice px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">Ver factura</button>
    </div>
  `;
      listContainer.appendChild(div);

      // Validación: asegúrate de que clientData.cliente existe
      if (!clientData.cliente) {
        div.innerHTML += `<p class="text-red-500">No se encontraron datos del cliente.</p>`;
        listContainer.appendChild(div);
        return;
      }

                        // ...dentro del forEach...
            const cliente: ClienteData = {
              _id: (clientData.cliente as any)._id || "",
              nombre: (clientData.cliente as any).nombre || "",
              apellido: (clientData.cliente as any).apellido || "",
              cedula: (clientData.cliente as any).cedula || "",
              direccion: (clientData.cliente as any).direccion || "",
            };
            
            // Ahora úsalo en los botones:
            const downloadBtn = div.querySelector(".download-pdf")!;
            downloadBtn.addEventListener("click", () => {
              const invoiceHtml = generateInvoiceHTML(sale, cliente);
              const tempElement = document.createElement("div");
              tempElement.innerHTML = invoiceHtml;
            
              html2pdf()
                .from(tempElement)
                .set({
                  margin: 0.5,
                  filename: `Factura_${sale.id_venta}.pdf`,
                  html2canvas: { scale: 2 },
                  jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
                })
                .save();
            });
            
            const viewBtn = div.querySelector(".view-invoice")!;
            viewBtn.addEventListener("click", () => {
              showInvoice(sale, cliente);
            });

            listContainer.appendChild(div);
    });
  })();
}
