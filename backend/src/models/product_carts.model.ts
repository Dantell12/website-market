import { DataTypes } from "sequelize";
import sequelize from "../config/conection";

export const CarritoProductoModel = sequelize.define('carrito_productos', {
  id_carrito_pro: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_carrito: { type: DataTypes.INTEGER, allowNull: false },
  id_producto: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  impuesto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  freezeTableName: true,
  timestamps: false,
});