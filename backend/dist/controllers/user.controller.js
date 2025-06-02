"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newUser = exports.loginUser = void 0;
const users_model_1 = require("../models/users.model"); // Asegúrate de que este modelo esté bien exportado
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const clients_model_1 = require("../models/clients.model");
const SECRET_KEY = "IkN5IPS8KhXGa&-RnR}eX)RS~Cy}8R";
/**
 * Método loginUser
 * Este método permite iniciar sesión a un usuario existente
 */
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Buscar el usuario por email
        const user = yield users_model_1.UsuarioModel.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({
                msg: `No existe un usuario con el email ${email}`,
            });
            return;
        }
        // Comparar contraseña
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                msg: "Contraseña incorrecta",
            });
            return;
        }
        const client = yield clients_model_1.ClienteModel.findOne({
            where: { id_usuario: user.id_usuario },
        });
        if (!client) {
            res.status(404).json({
                msg: `No existe un cliente con el id_usuario} ${user.id_usuario}`,
            });
            return;
        }
        // Generar token
        const token = jsonwebtoken_1.default.sign({
            id_usuario: user.id_usuario,
            email: user.email,
            rol: user.rol,
        }, SECRET_KEY || "default_secret", { expiresIn: "2h" });
        res.json({
            msg: "Inicio de sesión exitoso",
            token,
            user: {
                id_usuario: user.id_usuario,
                email: user.email,
                rol: user.rol,
                id_cliente: client.id_cliente,
            },
        });
    }
    catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({
            msg: "Error al iniciar sesión",
        });
    }
});
exports.loginUser = loginUser;
// REGISTRO DE USUARIO
const newUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, nombre, apellido, cedula, direccion } = req.body;
    try {
        // Validar si el email ya existe
        const userExist = yield users_model_1.UsuarioModel.findOne({ where: { email } });
        if (userExist) {
            res.status(400).json({ msg: "El correo electrónico ya está registrado" });
        }
        // Hashear la contraseña
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Crear usuario
        const createdUser = yield users_model_1.UsuarioModel.create({
            email,
            password: hashedPassword,
            rol: "cliente",
        });
        // Verificar si la cédula ya existe
        const existingClient = yield clients_model_1.ClienteModel.findOne({ where: { cedula } });
        if (!existingClient) {
            // Crear cliente con id_usuario
            yield clients_model_1.ClienteModel.create({
                nombre,
                apellido,
                cedula,
                direccion,
                id_usuario: createdUser.get("id_usuario"),
            });
        }
        res.status(201).json({
            msg: "Usuario registrado correctamente",
            userId: createdUser.get("id_usuario"),
        });
    }
    catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ msg: "Error al registrar usuario", error });
    }
});
exports.newUser = newUser;
