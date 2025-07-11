// src/models/usuario.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface ICliente {
  nombre: string;
  apellido: string;
  cedula: string;
  direccion: string;
}

export interface IUsuario extends Document {
  email: string;
  password: string;
  rol: "admin" | "cliente";
  cliente?: ICliente;
}

const ClienteSubschema = new Schema<ICliente>(
  {
    nombre:    { type: String },
    apellido:  { type: String },
    cedula:    { type: String },
    direccion: { type: String },
  },
  { _id: false }
);

const UsuarioSchema = new Schema<IUsuario>(
  {
    email:    { type: String, required: true, match: /^\S+@\S+\.\S+$/, unique: true },
    password: { type: String, required: true },
    rol:      { type: String, required: true, enum: ["admin", "cliente"] },
    cliente:  { type: ClienteSubschema }, // sólo válido si rol==='cliente'
  },
  {
    collection: "usuarios",
    timestamps: false,
  }
);

export const Usuario = model<IUsuario>("Usuario", UsuarioSchema);
