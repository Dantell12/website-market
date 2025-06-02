"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarritoModel = void 0;
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../config/conection"));
exports.CarritoModel = conection_1.default.define('carritos', {
    id_carrito: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_cliente: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    fecha: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
    estado: { type: sequelize_1.DataTypes.STRING(20), defaultValue: 'activo' },
}, {
    freezeTableName: true,
    timestamps: false,
});
