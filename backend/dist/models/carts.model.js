"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Carrito = void 0;
// src/models/carrito.model.ts
const mongoose_1 = require("mongoose");
const CarritoItemSchema = new mongoose_1.Schema({
    id_producto: { type: mongoose_1.Schema.Types.ObjectId, ref: "Producto", required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precio_unitario: { type: Number, required: true, min: 0 },
    impuesto: { type: Number, min: 0 },
    subtotal: { type: Number, min: 0 },
}, { _id: false });
const CarritoSchema = new mongoose_1.Schema({
    id_cliente: { type: mongoose_1.Schema.Types.ObjectId, ref: "Usuario", required: true },
    fecha: { type: Date },
    estado: { type: String, required: true, enum: ["activo", "abandonado", "completado"] },
    productos: { type: [CarritoItemSchema], required: true },
}, {
    collection: "carritos",
    timestamps: false,
});
exports.Carrito = (0, mongoose_1.model)("Carrito", CarritoSchema);
