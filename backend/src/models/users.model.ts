import { DataTypes } from "sequelize";
import sequelize from "../config/conection";

export const UsuarioModel = sequelize.define('usuarios', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  password: { type: DataTypes.TEXT, allowNull: false },
  rol: { 
    type: DataTypes.STRING(20), 
    allowNull: false, 
    validate: { isIn: [['admin', 'cliente']] }
  },
}, {
  freezeTableName: true,
  timestamps: false,
});



