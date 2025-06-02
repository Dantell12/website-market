"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalleVentaModel = void 0;
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../config/conection"));
exports.DetalleVentaModel = conection_1.default.define('detalle_ventas', {
    id_detalle_venta: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_venta: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    id_producto: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    cantidad: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    precio_unitario: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    impuesto: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
    freezeTableName: true,
    timestamps: false,
});
