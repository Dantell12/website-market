// src/pages/cartPage.ts
import {
  listCartProducts,
  updateCartProduct,
  removeProductFromCart,
} from "../services/cart.service";
import { Navbar } from "../components/navbar";
import type { CartItemInterface } from "../interfaces/cart-item.interface";
import { confirmSale } from "../services/sales.service";

export function CartPage(containerId: string) {
  const root = document.getElementById(containerId)!;
  root.innerHTML = "";
  root.appendChild(Navbar());

  root.innerHTML += `
    <div class="p-6 flex flex-col lg:flex-row gap-6">
      <!-- IZQUIERDA: items -->
      <div id="cart-items" class="flex-1 space-y-4"></div>

      <!-- DERECHA: resumen -->
      <div id="cart-summary" class="w-full lg:w-1/3 bg-white shadow-md rounded p-6">
        <h2 class="text-2xl font-semibold mb-4">Resumen de compra</h2>
        <div id="summary-lines" class="space-y-2 mb-4"></div>
        <div class="border-t pt-4">
          <p class="text-lg font-bold">
            Total: $<span id="cart-total">0.00</span>
          </p>
        </div>
        <button id="checkout-btn"
                disabled
                class="mt-6 w-full bg-blue-600 text-white py-2 rounded font-semibold opacity-50 cursor-not-allowed">
          Realizar compra
        </button>
      </div>
    </div>
  `;

  const itemsContainer = root.querySelector<HTMLElement>("#cart-items")!;
  const summaryLines = root.querySelector<HTMLElement>("#summary-lines")!;
  const totalEl = root.querySelector<HTMLSpanElement>("#cart-total")!;
  const checkoutBtn = root.querySelector<HTMLButtonElement>("#checkout-btn")!;

  async function loadCart() {
    itemsContainer.innerHTML = `<p class="text-gray-600">Cargando carrito...</p>`;
    const items = await listCartProducts();

    if (!items || items.length === 0) {
      itemsContainer.innerHTML = `<p class="text-gray-500">El carrito está vacío.</p>`;
      summaryLines.innerHTML = "";
      totalEl.textContent = "0.00";
      checkoutBtn.disabled = true;
      checkoutBtn.classList.add("opacity-50", "cursor-not-allowed");
      checkoutBtn.onclick = null;
      return;
    }

    itemsContainer.innerHTML = "";
    let total = 0;

    // Guardamos el estado original de cada cantidad para poder resetear en caso de error
    const originalQuantities: Record<number, number> = {};
    items.forEach((item: CartItemInterface) => {
      originalQuantities[item.producto!.id_producto] = item.cantidad;
      total += Number(item.subtotal);

      const div = document.createElement("div");
      div.className =
        "bg-white shadow-md rounded p-4 flex justify-between items-center";

      div.innerHTML = /* html */ `
        <div class="flex-1">
          <h3 class="text-lg font-semibold">${item.producto!.nombre}</h3>
          <p class="text-sm text-gray-500">Unitario: $${item.precio_unitario}</p>
          <p class="text-sm text-gray-500">IVA 15%: $${item.impuesto}</p>
          <p class="text-sm text-gray-500">Subtotal: $${item.subtotal}</p>
        </div>
        <div class="flex items-center space-x-2">
          <input 
            type="number" min="1" value="${item.cantidad}"
            class="border px-2 py-1 w-16 rounded text-center qty-input"
            data-producto="${item.producto!.id_producto}"
          />
          <button 
            class="remove-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            data-producto="${item.producto!.id_producto}"
          >
            Eliminar
          </button>
        </div>
      `;

      itemsContainer.appendChild(div);
    });

    // Render líneas del resumen
    summaryLines.innerHTML = "";
    items.forEach((item: CartItemInterface) => {
      const producto = item.producto!;
      const line = document.createElement("p");
      line.className = "flex justify-between";
      line.innerHTML = `
        <span>${producto.nombre} x${item.cantidad}</span>
        <span>$${item.subtotal}</span>
      `;
      summaryLines.appendChild(line);
    });

    totalEl.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;
    checkoutBtn.classList.remove("opacity-50", "cursor-not-allowed");

    // Checkout
    checkoutBtn.onclick = async () => {
      const id_cliente = Number(localStorage.getItem("id_cliente"));
      const result = await confirmSale(id_cliente);
      if (result.success) {
        alert(`Venta confirmada`);
        loadCart();
      } else {
        alert(result.msg);
      }
    };

    // CAMBIAR CANTIDAD: ahora capturamos errores 400 por stock insuficiente
    itemsContainer
      .querySelectorAll<HTMLInputElement>(".qty-input")
      .forEach((input) => {
        input.addEventListener("change", async () => {
          const prodId = Number(input.dataset.producto);
          const newQty = Number(input.value);
          const id_cliente = Number(localStorage.getItem("id_cliente"));

          if (newQty < 1) {
            input.value = "1";
            return;
          }

          try {
            // Llamamos al servicio que hace PUT /api/carts/:id_cliente/:id_producto/:cantidad
            const ok = await updateCartProduct(id_cliente, prodId, newQty);
            if (ok) {
              loadCart();
            } else {
              // Si el servicio devolvió { success: false, msg: ... }
              alert("No se pudo actualizar la cantidad.");
              input.value = originalQuantities[prodId].toString();
            }
          } catch (err: any) {
            // Si AxiosError con status 400 → stock insuficiente
            if (err.response && err.response.status === 400) {
              alert(err.response.data.msg); 
            } else {
              alert("Error al actualizar la cantidad.");
            }
            // Siempre restablecemos al valor original
            input.value = originalQuantities[prodId].toString();
          }
        });
      });

    // ELIMINAR PRODUCTO
    itemsContainer
      .querySelectorAll<HTMLButtonElement>(".remove-btn")
      .forEach((btn) => {
        btn.addEventListener("click", async () => {
          const prodId = Number(btn.dataset.producto);
          const id_cliente = Number(localStorage.getItem("id_cliente"));
          if (confirm("¿Eliminar este producto del carrito?")) {
            const ok = await removeProductFromCart(id_cliente, prodId);
            if (ok) {
              loadCart();
            } else {
              alert("No se pudo eliminar el producto.");
            }
          }
        });
      });
  }

  loadCart();
}
