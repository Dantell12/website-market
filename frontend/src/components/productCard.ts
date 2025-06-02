import type { ProductInterface } from "../interfaces/product.interface";

export function ProductCard(
  product: ProductInterface,
  onAdd: (p: ProductInterface) => void
): HTMLElement {
  const card = document.createElement("div");
  card.className = `
    bg-white rounded-lg shadow-md overflow-hidden flex flex-col
    transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl
    border border-gray-200
  `;

  // 1) Calculamos descuento según temporada
  let descuento = 0;
  if (product.temporada === "media") descuento = 0.25;
  else if (product.temporada === "baja") descuento = 0.35;

  const precioOriginal = product.precio;
  const precioConDescuento = precioOriginal * (1 - descuento);

  // 2) ¿Stock agotado?
  const agotado = product.stock === 0;

  // 3) ¿Stock bajo (<=5)?
  const stockBajo = product.stock > 0 && product.stock <= 5;

  card.innerHTML = `
    <img src="${product.img}" alt="${product.nombre}" class="h-48 w-full object-cover" />
    <div class="p-4 flex-1 flex flex-col">
      <h3 class="text-xl font-bold text-black mb-1">${product.nombre}</h3>
      <p class="text-sm text-gray-600 mb-2">Categoría: ${product.categoria}</p>

      ${
        descuento > 0
          ? `<p class="text-sm mb-2">
               Precio: 
               <span class="line-through text-gray-400">USD ${precioOriginal}</span>
               <span class="font-semibold text-red-600 ml-1">USD ${precioConDescuento}</span>
             </p>`
          : `<p class="text-sm text-gray-800 mb-2">Precio: USD ${precioOriginal}</p>`
      }

      <p class="text-sm mb-2 ${
        agotado ? "text-red-600 font-semibold" : "text-gray-800"
      }">
        Stock: ${agotado ? "Agotado" : product.stock}
      </p>

      ${
        stockBajo && !agotado
          ? `<p class="text-xs text-yellow-800 bg-yellow-100 px-2 py-1 rounded mb-2">
               ⚠ Quedan solo ${product.stock} unidades
             </p>`
          : ""
      }

      <button
        class="mt-auto py-2 rounded text-white ${
          agotado
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-800"
        }"
        ${agotado ? "disabled" : ""}
      >
        ${agotado ? "No disponible" : "Agregar al carrito"}
      </button>
    </div>
  `;

  // Si no está agotado, permitimos añadir
  if (!agotado) {
    const btn = card.querySelector("button")!;
    btn.addEventListener("click", () => onAdd(product));
  }

  return card;
}
