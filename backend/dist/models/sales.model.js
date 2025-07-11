"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Venta = void 0;
// src/models/venta.model.ts
const mongoose_1 = require("mongoose");
const VentaDetalleSchema = new mongoose_1.Schema({
    id_producto: { type: mongoose_1.Schema.Types.ObjectId, ref: "Producto", required: true },
    cantidad: { type: Number, required: true },
    precio_unitario: { type: Number, required: true },
    impuesto: { type: Number },
    subtotal: { type: Number },
}, { _id: false });
const VentaSchema = new mongoose_1.Schema({
    id_cliente: { type: mongoose_1.Schema.Types.ObjectId, ref: "Usuario", required: true },
    id_carrito: { type: mongoose_1.Schema.Types.ObjectId, ref: "Carrito" },
    fecha: { type: Date },
    subtotal: { type: Number, min: 0 },
    impuestos: { type: Number, min: 0 },
    total: { type: Number, required: true, min: 0 },
    detalle: { type: [VentaDetalleSchema] },
}, {
    collection: "ventas",
    timestamps: false,
});
exports.Venta = (0, mongoose_1.model)("Venta", VentaSchema);
