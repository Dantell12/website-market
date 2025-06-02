"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarritoProductoModel = void 0;
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../config/conection"));
exports.CarritoProductoModel = conection_1.default.define('carrito_productos', {
    id_carrito_pro: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_carrito: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    id_producto: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    cantidad: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    precio_unitario: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    impuesto: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
    freezeTableName: true,
    timestamps: false,
});
