// src/pages/storePage.ts

import { Navbar } from "../components/navbar";
import { ProductCard } from "../components/productCard";
import type { ProductInterface } from "../interfaces/product.interface";
import { addProductToCart } from "../services/cart.service";
import { getAllProducts } from "../services/product.service";

async function addToCart(prod: ProductInterface) {
  const id_cliente = Number(localStorage.getItem("id_cliente"));
  const cantidad = 1;

  if (!id_cliente) {
    alert("Debes iniciar sesión para agregar productos al carrito.");
    return;
  }

  const result = await addProductToCart(id_cliente, prod.id_producto, cantidad);

  if (result.success) {
    alert(`"${prod.nombre}" agregado al carrito.`);
  } else if (result.msg === "El producto ya está agregado al carrito") {
    alert("Este producto ya está en tu carrito.");
  } else {
    alert(result.msg);
  }
}

export function StorePage(containerId: string) {
  const root = document.getElementById(containerId)!;
  root.innerHTML = "";
  root.appendChild(Navbar());

  root.innerHTML += /* html */ `
    <div class="p-6">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Tienda</h2>
      <div id="products-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
    </div>
  `;

  const grid = root.querySelector<HTMLElement>("#products-grid")!;

  (async () => {
    grid.innerHTML = `<p class="text-gray-600">Cargando productos...</p>`;
    const products = (await getAllProducts()) || [];
    if (products.length === 0) {
      grid.innerHTML = `<p class="text-gray-500">No hay productos disponibles.</p>`;
      return;
    }
    grid.innerHTML = "";
    products.forEach((p: ProductInterface) => {
      const card = ProductCard(p, () => addToCart(p));
      grid.appendChild(card);
    });
  })();
}
