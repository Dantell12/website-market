import { DataTypes } from "sequelize";
import sequelize from "../config/conection";

export const DetalleVentaModel = sequelize.define('detalle_ventas', {
  id_detalle_venta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_venta: { type: DataTypes.INTEGER, allowNull: false },
  id_producto: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  impuesto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  freezeTableName: true,
  timestamps: false,
});
