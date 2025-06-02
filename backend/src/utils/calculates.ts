export function calcularPrecioFinal(producto: any, cantidad: number) {
  let descuento = 0;

  if (producto.temporada === "media") {
    descuento = 0.25;
  } else if (producto.temporada === "baja") {
    descuento = 0.35;
  }

  const precioConDescuento = Number(producto.precio) * (1 - descuento);
  const impuesto = precioConDescuento * 0.15;
  const subtotal = (precioConDescuento + impuesto) * cantidad;

  return { precioConDescuento, impuesto, subtotal };
}
