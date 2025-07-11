"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
// src/models/usuario.model.ts
const mongoose_1 = require("mongoose");
const ClienteSubschema = new mongoose_1.Schema({
    nombre: { type: String },
    apellido: { type: String },
    cedula: { type: String },
    direccion: { type: String },
}, { _id: false });
const UsuarioSchema = new mongoose_1.Schema({
    email: { type: String, required: true, match: /^\S+@\S+\.\S+$/, unique: true },
    password: { type: String, required: true },
    rol: { type: String, required: true, enum: ["admin", "cliente"] },
    cliente: { type: ClienteSubschema }, // sólo válido si rol==='cliente'
}, {
    collection: "usuarios",
    timestamps: false,
});
exports.Usuario = (0, mongoose_1.model)("Usuario", UsuarioSchema);
