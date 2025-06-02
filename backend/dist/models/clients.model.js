"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteModel = void 0;
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../config/conection"));
exports.ClienteModel = conection_1.default.define('clientes', {
    id_cliente: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
    apellido: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
    cedula: { type: sequelize_1.DataTypes.STRING(20), unique: true, allowNull: false },
    direccion: { type: sequelize_1.DataTypes.TEXT },
    id_usuario: { type: sequelize_1.DataTypes.INTEGER, unique: true, allowNull: true },
}, {
    freezeTableName: true,
    timestamps: false,
});
