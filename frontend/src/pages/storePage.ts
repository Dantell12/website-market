// src/pages/storePage.ts

import { Navbar } from "../components/navbar";
import { ProductCard } from "../components/productCard";
import type { ProductInterface } from "../interfaces/product.interface";
import { addProductToCart } from "../services/cart.service";
import { getAllProducts } from "../services/product.service";

async function addToCart(prod: ProductInterface) {
  const id_cliente = localStorage.getItem("id");
  const cantidad = 1;

  if (!id_cliente || id_cliente === "null") {
    alert("Debes iniciar sesión para agregar productos al carrito.");
    return;
  }

  try {
    await addProductToCart(id_cliente, prod._id, cantidad);
    alert(`"${prod.nombre}" ha sido agregado al carrito.`);
  } catch (error: any) {
    // El backend ya envía un mensaje claro en caso de error (ej: producto ya en carrito, stock insuficiente)
    // y lo mostramos directamente.
    alert(error.response?.data?.msg || "Ocurrió un error inesperado al agregar el producto.");
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
