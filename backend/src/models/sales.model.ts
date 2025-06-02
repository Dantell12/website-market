import { DataTypes } from "sequelize";
import sequelize from "../config/conection";


export const VentaModel = sequelize.define('ventas', {
  id_venta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  id_carrito: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  impuestos: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  freezeTableName: true,
  timestamps: false,
});