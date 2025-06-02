export type Temporada = "alta" | "media" | "baja";

export interface ProductInterface {
  id_producto: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;         // JSON suele devolver string, pero con axios y Sequelize viene como number
  stock: number;
  temporada: Temporada;
  img : string;
  creado_en: string;      // ISO date string
}
