// 3) Reporte de ingresos por temporada
export interface IncomeBySeason {
  temporada: string;
  ingresoTotal: string | number;
}
// 4) Reporte de productos con estado, descuento y alerta de stock
export interface ProductReport {
  id_producto: number;
  nombre: string;
  categoria: string;
  temporada: string;
  precio: number;
  descuentoRate: number;
  precio_con_descuento: number;
  stock: number;
  estado: "agotado" | "mínimo" | "disponible";
  alerta: boolean;
}
// 5) Reporte de clientes frecuentes
export interface FrequentCustomer {
  cliente: {
    id_cliente: number;
    nombre: string;
    apellido: string;
    email?: string;
    cedula: string;
  } | null;
  cantidadVentas: number;
}
// 7) Reporte de carritos abandonados
export interface AbandonedCart {
  id_carrito: number;
  cliente: {
    id_cliente: number;
    nombre: string;
    apellido: string;
    cedula: string;
    email?: string;
  } | null;
  fecha: string;
} // 6) Reporte de productos no vendidos
export interface UnsoldProduct {
  id_producto: number;
  nombre: string;
  categoria: string;
  stock: number;
  temporada: string;
}
