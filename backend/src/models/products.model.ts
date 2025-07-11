// src/models/producto.model.ts
import { Schema, model, Document } from "mongoose";

export interface IProducto extends Document {
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  temporada: "alta" | "media" | "baja";
  img?: string;
  creado_en?: Date;
  alerta_stock?: boolean;
}

const ProductoSchema = new Schema<IProducto>(
  {
    codigo:       { type: String, required: true, unique: true },
    nombre:       { type: String, required: true },
    categoria:    { type: String, required: true },
    precio:       { type: Number, required: true, min: 0 },
    stock:        { type: Number, required: true, min: 0 },
    temporada:    { type: String, required: true, enum: ["alta", "media", "baja"] },
    img:          { type: String },
    creado_en:    { type: Date },
    alerta_stock: { type: Boolean },
  },
  {
    collection: "productos",
    timestamps: false,
  }
);

export const Producto = model<IProducto>("Producto", ProductoSchema);
