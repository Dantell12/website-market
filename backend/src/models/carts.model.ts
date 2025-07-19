// src/models/carrito.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface ICarritoItem {
  id_producto: Types.ObjectId;
  cantidad: number;
  precio_unitario: number;
  impuesto?: number;
  subtotal?: number;
}

export interface ICarrito extends Document {
  id_cliente: Types.ObjectId;
  fecha?: Date;
  estado: "activo" | "abandonado" | "completado";
  productos: ICarritoItem[];
  numero?: number; // Agregado para el número de carrito
}

const CarritoItemSchema = new Schema<ICarritoItem>(
  {
    id_producto:      { type: Schema.Types.ObjectId, ref: "Producto", required: true },
    cantidad:         { type: Number, required: true, min: 1 },
    precio_unitario:  { type: Number, required: true, min: 0 },
    impuesto:         { type: Number, min: 0 },
    subtotal:         { type: Number, min: 0 },
  },
  { _id: false }
);

const CarritoSchema = new Schema<ICarrito>(
  {
    id_cliente:   { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    fecha:        { type: Date },
    estado:       { type: String, required: true, enum: ["activo", "abandonado", "completado"] },
    productos:    { type: [CarritoItemSchema], required: true },
    numero:       { type: Number }, // Agregado para el número de carrito
  },
  {
    collection: "carritos",
    timestamps: false,
  }
);

export const Carrito = model<ICarrito>("Carrito", CarritoSchema);
