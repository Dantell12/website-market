// src/components/client/clientForm.ts

import type { ClientInterface } from "../interfaces/client.interface";
import {
  createClient,
  updateClient,
} from "../services/client.service";

export class ClientForm {
  private onSave: () => void;
  private overlay!: HTMLElement;
  private client?: ClientInterface;

  /**
   * @param onSave Callback que se llama después de crear/actualizar para recargar la tabla
   */
  constructor(onSave: () => void) {
    this.onSave = onSave;
  }

  /**
   * Muestra el modal. Si pasas `client`, lo abre en modo edición.
   */
  public show(client?: ClientInterface) {
    this.client = client;

    // Overlay
    this.overlay = document.createElement("div");
    this.overlay.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    // Modal
    const modal = document.createElement("div");
    modal.className = "bg-white rounded-lg shadow-xl w-96 p-6";

    // Formulario
    modal.innerHTML = `
      <form id="client-form" class="space-y-4">
        <h3 class="text-xl font-bold mb-2">
          ${client ? "Editar Cliente" : "Nuevo Cliente"}
        </h3>
        <input name="nombre" type="text" placeholder="Nombre" required
               value="${client?.nombre || ""}"
               class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"/>
        <input name="apellido" type="text" placeholder="Apellido" required
               value="${client?.apellido || ""}"
               class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"/>
        <input name="cedula" type="text" placeholder="Cédula" required
               value="${client?.cedula || ""}"
               class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"/>
        <input name="direccion" type="text" placeholder="Dirección"
               value="${client?.direccion || ""}"
               class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"/>

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
      .querySelector<HTMLFormElement>("#client-form")!
      .addEventListener("submit", (e) => this.onSubmit(e));
  }

  /** Maneja el submit del formulario */
  private async onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nombre = (form.nombre as HTMLInputElement).value.trim();
    const apellido = (form.apellido as HTMLInputElement).value.trim();
    const cedula = (form.cedula as HTMLInputElement).value.trim();
    const direccion = (form.direccion as HTMLInputElement).value.trim() || null;

    const payload = { nombre, apellido, cedula, direccion };

    try {
      if (this.client) {
        // Editar
        await updateClient(this.client.id_cliente, payload);
      } else {
        // Crear
        await createClient(payload);
      }
      this.onSave();
      this.close();
    } catch {
      alert("Hubo un error al guardar el cliente.");
    }
  }

  /** Cierra y destruye el modal */
  private close() {
    this.overlay.remove();
  }
}
