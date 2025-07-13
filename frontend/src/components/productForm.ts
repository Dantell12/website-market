/* src/components/product/productForm.ts */

import type { ProductInterface, Temporada } from "../interfaces/product.interface";
import { createProduct, updateProduct } from "../services/product.service";


export class ProductForm {
  private onSave: () => void;
  private overlay!: HTMLElement;
  private product?: ProductInterface;

  constructor(onSave: () => void) {
    this.onSave = onSave;
  }

  public show(product?: ProductInterface) {
    this.product = product;

    // Overlay
    this.overlay = document.createElement("div");
    this.overlay.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    // Modal
    const modal = document.createElement("div");
    modal.className = "bg-white rounded-lg shadow-xl w-96 p-6";

    // Formulario
    modal.innerHTML = `
      <form id="product-form" class="space-y-4">
        <h3 class="text-xl font-bold mb-2">
          ${product ? "Editar Producto" : "Nuevo Producto"}
        </h3>
        <input name="codigo" type="text" placeholder="Código" required
               value="${product?.codigo || ""}"
               class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"/>
        <input name="nombre" type="text" placeholder="Nombre" required
               value="${product?.nombre || ""}"
               class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"/>
        <input name="categoria" type="text" placeholder="Categoría" required
               value="${product?.categoria || ""}"
               class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"/>
        <input name="precio" type="number" placeholder="Precio" step="0.01" min="0" required
               value="${product?.precio ?? ""}"
               class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"/>
        <input name="stock" type="number" placeholder="Stock" min="0" required
               value="${product?.stock ?? ""}"
               class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"/>
        <input name="img" type="file" accept="image/png, image/jpeg" 
               class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"/>
               value ="              ${product?.img ? `<img src="/api/products/image/${product.img}" alt="Imagen actual" class="mx-auto h-24 w-24 object-cover mb-2 rounded" />` : ""}"
        <select name="temporada" required
                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
          <option value="">Temporada...</option>
          ${(["alta","media","baja"] as Temporada[])
            .map(t => `
              <option value="${t}" ${product?.temporada===t?"selected":""}>
                ${t.charAt(0).toUpperCase()+t.slice(1)}
              </option>
            `).join("")}
        </select>

        <div class="flex justify-end gap-3 mt-4">
          <button type="button" id="cancel" 
                  class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
            Cancelar
          </button>
          <button type="submit" 
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
            Guardar
          </button>
        </div>
      </form>
    `;

    this.overlay.appendChild(modal);
    document.body.appendChild(this.overlay);

    // Listeners
    modal.querySelector("#cancel")!.addEventListener("click", () => this.close());
    modal
      .querySelector<HTMLFormElement>("#product-form")!
      .addEventListener("submit", (e) => this.onSubmit(e));
  }

  private async onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const codigo = (form.codigo as HTMLInputElement).value.trim();
    const nombre = (form.nombre as HTMLInputElement).value.trim();
    const categoria = (form.categoria as HTMLInputElement).value.trim();
    const precio = parseFloat((form.precio as HTMLInputElement).value);
    const stock = parseInt((form.stock as HTMLInputElement).value, 10);
    const temporada = (form.temporada as HTMLSelectElement).value as Temporada;
    const imgFile = (form.img as HTMLInputElement).files?.[0];

    const formData = new FormData();
    formData.append("codigo", codigo);
    formData.append("nombre", nombre);
    formData.append("categoria", categoria);
    formData.append("precio", precio.toString());
    formData.append("stock", stock.toString());
    formData.append("temporada", temporada);
    if (imgFile) {
      formData.append("img", imgFile);
    }
    try {
        if (this.product) {
          // Actualización con formData (requiere que updateProduct acepte formData)
          await updateProduct(this.product._id, formData);
        } else {
          // Creación con formData
          await createProduct(formData);
        }
        this.onSave();
        this.close();
      } catch {
        alert("Error al guardar el producto.");
      }
    }

  private close() {
    this.overlay.remove();
  }
}
