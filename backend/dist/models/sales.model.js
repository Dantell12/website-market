"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaModel = void 0;
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../config/conection"));
exports.VentaModel = conection_1.default.define('ventas', {
    id_venta: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_cliente: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    id_carrito: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    fecha: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
    subtotal: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    impuestos: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    total: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
    freezeTableName: true,
    timestamps: false,
});
