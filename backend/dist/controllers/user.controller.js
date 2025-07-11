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
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_model_1 = require("../models/users.model");
const SECRET_KEY = process.env.SECRET_KEY || "pepito123";
// POST /api/users/register
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, nombre, apellido, cedula, direccion } = req.body;
    try {
        // 1) Validar email único
        if (yield users_model_1.Usuario.findOne({ email })) {
            res.status(400).json({ msg: "El correo ya está registrado" });
            return;
        }
        // 2) Crear usuario
        const hashed = yield bcrypt_1.default.hash(password, 10);
        const usuario = yield users_model_1.Usuario.create({
            email,
            password: hashed,
            rol: "cliente",
        });
        // 3) Crear subdocumento cliente
        const clienteData = { nombre, apellido, cedula, direccion };
        usuario.cliente = clienteData;
        yield usuario.save();
        res.status(201).json({ msg: "Usuario registrado", userId: usuario._id });
    }
    catch (err) {
        console.error("Error registerUser:", err);
        res.status(500).json({ msg: "Error interno al registrar usuario" });
    }
});
exports.registerUser = registerUser;
// POST /api/users/login
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const usuario = yield users_model_1.Usuario.findOne({ email });
        if (!usuario) {
            res.status(404).json({ msg: "Usuario no encontrado" });
            return;
        }
        const valid = yield bcrypt_1.default.compare(password, usuario.password);
        if (!valid) {
            res.status(401).json({ msg: "Contraseña incorrecta" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: usuario._id, email: usuario.email, rol: usuario.rol }, SECRET_KEY, { expiresIn: "2h" });
        res.json({
            msg: "Login exitoso",
            token,
            user: {
                id: usuario._id,
                email: usuario.email,
                rol: usuario.rol,
                cliente: usuario.cliente || null,
            },
        });
    }
    catch (err) {
        console.error("Error loginUser:", err);
        res.status(500).json({ msg: "Error interno al iniciar sesión" });
    }
});
exports.loginUser = loginUser;
