// src/pages/adminClientesPage.ts
import { ClientForm } from "../components/clientForm";
import { Navbar } from "../components/navbar";
import { deleteClient, getAllClients } from "../services/client.service";


export function AdminClientesPage(containerId: string) {
  const root = document.getElementById(containerId)!;
  root.innerHTML = "";
  root.appendChild(Navbar());

  // Estructura base
  root.innerHTML += /* html */`
    <div class="p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-3xl font-bold text-gray-800 tracking-tight">
          Administrar Clientes
        </h2>
        <button id="btn-new-client" 
                class="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-5 rounded-lg shadow transition">
          <i class="fas fa-user-plus"></i> Nuevo Cliente
        </button>
      </div>
      <div id="client-table" class="overflow-auto rounded-lg border border-gray-200 shadow-lg bg-white"></div>
    </div>
  `;

  const btnNew = root.querySelector<HTMLButtonElement>("#btn-new-client")!;
  const tableDiv = root.querySelector<HTMLElement>("#client-table")!;

  // Instancia del formulario
  const formCmp = new ClientForm(() => loadTable());

  btnNew.addEventListener("click", () => formCmp.show());

  // Inicial
  loadTable();

  async function loadTable() {
    tableDiv.innerHTML = `<p class="p-4 text-gray-600">Cargando clientes...</p>`;
    const clients = await getAllClients() || [];
    if (clients.length === 0) {
      tableDiv.innerHTML = `<p class="p-4 text-gray-500">No hay clientes registrados.</p>`;
      return;
    }

    const rows = clients.map((c, idx) => /* html */`
      <tr class="hover:bg-gray-50 transition">
        <td class="px-4 py-2 text-center">${c._id}</td>
        <td class="px-4 py-2">${c.cliente.nombre}</td>
        <td class="px-4 py-2">${c.cliente.apellido}</td>
        <td class="px-4 py-2">${c.cliente.cedula}</td>
        <td class="px-4 py-2">${c.cliente.direccion || ""}</td>
        <td class="px-4 py-2 text-center space-x-2">
          <button data-idx="${idx}" class="edit-btn inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1 px-3 rounded text-sm">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button data-idx="${idx}" class="del-btn inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </td>
      </tr>
    `).join("");

    tableDiv.innerHTML = /* html */`
      <table class="min-w-full text-sm text-left text-gray-700">
        <thead class="bg-green-700 text-white text-base">
          <tr>
            ${["ID","Nombre","Apellido","Cédula","Dirección","Acciones"]
              .map(h => `<th class="px-4 py-3 font-semibold">${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${rows}
        </tbody>
      </table>
    `;

    // Events
    tableDiv.querySelectorAll<HTMLButtonElement>(".edit-btn").forEach(btn =>
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        formCmp.show(clients[idx]);
      })
    );
    tableDiv.querySelectorAll<HTMLButtonElement>(".del-btn").forEach(btn =>
      btn.addEventListener("click", async () => {
        const idx = Number(btn.dataset.idx);
        if (confirm("¿Eliminar este cliente?")) {
          await deleteClient(clients[idx]._id);
          loadTable();
        }
      })
    );
  }
}
