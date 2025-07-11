// 3) Reporte de ingresos por temporada
export interface IncomeBySeason {
  temporada: string;
  ingresoTotal: string | number;
}

// 4) Reporte de productos con estado, descuento y alerta de stock
export interface ProductReport {
  _id: string; // MongoDB ID
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
    _id: string;
    nombre: string;
    apellido: string;
    email?: string;
    cedula: string;
  } | null;
  cantidadVentas: number;
}

// 7) Reporte de carritos abandonados
export interface AbandonedCart {
  _id: string; // id_carrito
  cliente: {
    _id: string;
    nombre: string;
    apellido: string;
    cedula: string;
    email?: string;
  } | null;
  fecha: string;
}

// 6) Reporte de productos no vendidos
export interface UnsoldProduct {
  _id: string;
  nombre: string;
  categoria: string;
  stock: number;
  temporada: string;
}