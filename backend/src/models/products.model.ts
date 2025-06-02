import { DataTypes } from "sequelize";
import sequelize from "../config/conection";

export const ProductoModel = sequelize.define(
  "productos",
  {
    id_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    nombre: { type: DataTypes.TEXT, allowNull: false },
    categoria: { type: DataTypes.TEXT, allowNull: false },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    stock: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    temporada: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [["alta", "media", "baja"]] },
    },
    img: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
