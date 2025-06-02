"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoModel = void 0;
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../config/conection"));
exports.ProductoModel = conection_1.default.define("productos", {
    id_producto: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    codigo: { type: sequelize_1.DataTypes.STRING(20), unique: true, allowNull: false },
    nombre: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    categoria: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    precio: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    stock: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    temporada: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [["alta", "media", "baja"]] },
    },
    img: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    creado_en: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
}, {
    freezeTableName: true,
    timestamps: false,
});
