"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioModel = void 0;
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../config/conection"));
exports.UsuarioModel = conection_1.default.define('usuarios', {
    id_usuario: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: sequelize_1.DataTypes.STRING(255), unique: true, allowNull: false },
    password: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    rol: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        validate: { isIn: [['admin', 'cliente']] }
    },
}, {
    freezeTableName: true,
    timestamps: false,
});
