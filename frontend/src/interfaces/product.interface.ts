export type Temporada = "alta" | "media" | "baja";

export interface ProductInterface {
  _id: string;           // MongoDB ID
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  temporada: Temporada;
  img: string;
  creado_en?: string;    // si tu backend lo envía
}