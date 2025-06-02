import { DataTypes } from "sequelize";
import sequelize from "../config/conection";

export const CarritoModel = sequelize.define('carritos', {
  id_carrito: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  estado: { type: DataTypes.STRING(20), defaultValue: 'activo' },
}, {
  freezeTableName: true,
  timestamps: false,
});
