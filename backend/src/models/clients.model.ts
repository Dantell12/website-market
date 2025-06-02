import { DataTypes } from "sequelize";
import sequelize from "../config/conection";


export const ClienteModel = sequelize.define('clientes', {
  id_cliente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false },
  cedula: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  direccion: { type: DataTypes.TEXT },
  id_usuario: { type: DataTypes.INTEGER, unique: true, allowNull: true },
}, {
  freezeTableName: true,
  timestamps: false,
});
