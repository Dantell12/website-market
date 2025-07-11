"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Producto = void 0;
// src/models/producto.model.ts
const mongoose_1 = require("mongoose");
const ProductoSchema = new mongoose_1.Schema({
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    categoria: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    temporada: { type: String, required: true, enum: ["alta", "media", "baja"] },
    img: { type: String },
    creado_en: { type: Date },
    alerta_stock: { type: Boolean },
}, {
    collection: "productos",
    timestamps: false,
});
exports.Producto = (0, mongoose_1.model)("Producto", ProductoSchema);
