// src/models/venta.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IVentaDetalle {
  id_producto: Types.ObjectId;
  cantidad: number;
  precio_unitario: number;
  impuesto?: number;
  subtotal?: number;
}

export interface IVenta extends Document {
  id_cliente: Types.ObjectId;
  id_carrito?: Types.ObjectId;
  fecha?: Date;
  subtotal?: number;
  impuestos?: number;
  total: number;
  detalle?: IVentaDetalle[];
}

const VentaDetalleSchema = new Schema<IVentaDetalle>(
  {
    id_producto:     { type: Schema.Types.ObjectId, ref: "Producto", required: true },
    cantidad:        { type: Number, required: true },
    precio_unitario: { type: Number, required: true },
    impuesto:        { type: Number },
    subtotal:        { type: Number },
  },
  { _id: false }
);

const VentaSchema = new Schema<IVenta>(
  {
    id_cliente:   { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    id_carrito:   { type: Schema.Types.ObjectId, ref: "Carrito" },
    fecha:        { type: Date },
    subtotal:     { type: Number, min: 0 },
    impuestos:    { type: Number, min: 0 },
    total:        { type: Number, required: true, min: 0 },
    detalle:      { type: [VentaDetalleSchema] },
  },
  {
    collection: "ventas",
    timestamps: false,
  }
);

export const Venta = model<IVenta>("Venta", VentaSchema);
