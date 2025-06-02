/* src/pages/adminProductosPage.ts */

import { Navbar } from "../components/navbar";
import { ProductForm } from "../components/productForm";
import { deleteProduct, getAllProducts } from "../services/product.service";

export function AdminProductosPage(containerId: string) {
  const root = document.getElementById(containerId)!;
  root.innerHTML = "";
  root.appendChild(Navbar());

  root.innerHTML += /* html */ `
    <div class="p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-3xl font-bold text-gray-800 tracking-tight">
          Administrar Productos
        </h2>
        <button id="btn-new-product" 
                class="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-5 rounded-lg shadow transition">
          <i class="fas fa-box-open"></i> Nuevo Producto
        </button>
      </div>
      <div id="product-table" class="overflow-auto rounded-lg border border-gray-200 shadow-lg bg-white"></div>
    </div>
  `;

  const btnNew = root.querySelector<HTMLButtonElement>("#btn-new-product")!;
  const tableDiv = root.querySelector<HTMLElement>("#product-table")!;

  const formCmp = new ProductForm(() => loadTable());
  btnNew.addEventListener("click", () => formCmp.show());

  loadTable();

  async function loadTable() {
    tableDiv.innerHTML = `<p class="p-4 text-gray-600">Cargando productos...</p>`;
    const products = (await getAllProducts()) || [];
    if (products.length === 0) {
      tableDiv.innerHTML = `<p class="p-4 text-gray-500">No hay productos registrados.</p>`;
      return;
    }

    console.log(products);
    const rows = products
      .map(
        (p, idx) => /* html */ `
      <tr class="hover:bg-gray-50 transition">
        <td class="px-4 py-2 text-center">${p.id_producto}</td>
        <td class="px-4 py-2">${p.codigo}</td>
        <td class="px-4 py-2">${p.nombre}</td>
        <td class="px-4 py-2">${p.categoria}</td>
        <td class="px-4 py-2 text-right">$${p.precio.toString()}</td>
        <td class="px-4 py-2 text-center">${p.stock}</td>
        <td class="px-4 py-2 text-center">
          <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium 
            ${
              p.temporada === "alta"
                ? "bg-green-100 text-green-700"
                : p.temporada === "media"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-200 text-gray-600"
            }">
            ${p.temporada.charAt(0).toUpperCase() + p.temporada.slice(1)}
          </span>
        </td>
        <td class="px-4 py-2 text-center">
          <img src="${p.img}" alt="Imagen del producto" class="mx-auto h-16 w-16 object-contain rounded" />
        </td>
        <td class="px-4 py-2 text-center space-x-2">
          <button data-idx="${idx}" class="edit-btn inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1 px-3 rounded text-sm">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button data-idx="${idx}" class="del-btn inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    tableDiv.innerHTML = /* html */ `
      <table class="min-w-full text-sm text-left text-gray-700">
        <thead class="bg-green-700 text-white text-base">
          <tr>
            ${[
              "ID",
              "Código",
              "Nombre",
              "Categoría",
              "Precio",
              "Stock",
              "Temporada",
              "URL Img",
              "Acciones",
            ]
              .map((h) => `<th class="px-4 py-3 font-semibold">${h}</th>`)
              .join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${rows}
        </tbody>
      </table>
    `;

    // Eventos
    tableDiv.querySelectorAll<HTMLButtonElement>(".edit-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        formCmp.show(products[idx]);
      })
    );
    tableDiv.querySelectorAll<HTMLButtonElement>(".del-btn").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const idx = Number(btn.dataset.idx);
        if (confirm("¿Eliminar este producto?")) {
          await deleteProduct(products[idx].id_producto);
          loadTable();
        }
      })
    );
  }
}
