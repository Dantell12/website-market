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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.postClient = exports.getClientById = exports.getClients = void 0;
const users_model_1 = require("../models/users.model");
// GET /api/clients
const getClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield users_model_1.Usuario.find({ rol: "cliente" }, "email cliente").lean();
        if (clients.length === 0) {
            res.status(404).json({ msg: "No hay clientes registrados" });
            return;
        }
        res.json(clients);
    }
    catch (err) {
        console.error("Error getClients:", err);
        res.status(500).json({ msg: "Error interno al obtener clientes" });
    }
});
exports.getClients = getClients;
// GET /api/clients/:id
const getClientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield users_model_1.Usuario.findById(id, "email cliente").lean();
        if (!user || user.rol !== "cliente") {
            res.status(404).json({ msg: "Cliente no encontrado" });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error("Error getClientById:", err);
        res.status(500).json({ msg: "Error interno al obtener cliente" });
    }
});
exports.getClientById = getClientById;
// POST /api/clients
const postClient = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, cliente } = req.body;
        if (!email || !password || !cliente || !cliente.nombre || !cliente.apellido || !cliente.cedula) {
            res.status(400).json({ msg: "Faltan datos requeridos" });
            return;
        }
        const usuarioExistente = yield users_model_1.Usuario.findOne({ email });
        if (usuarioExistente) {
            res.status(409).json({ msg: "Ya existe un usuario con ese correo" });
            return;
        }
        const nuevoUsuario = new users_model_1.Usuario({
            email,
            password,
            rol: "cliente",
            cliente,
        });
        yield nuevoUsuario.save();
        res.status(201).json({ msg: "Cliente creado correctamente", usuario: nuevoUsuario });
    }
    catch (err) {
        console.error("Error postClient:", err);
        res.status(500).json({ msg: "Error interno al crear cliente" });
    }
});
exports.postClient = postClient;
// PUT /api/clients/:id
const updateClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const usuario = yield users_model_1.Usuario.findById(id);
        if (!usuario || usuario.rol !== "cliente") {
            res.status(404).json({ msg: "Cliente no encontrado" });
            return;
        }
        usuario.cliente = Object.assign(Object.assign({}, usuario.cliente), updateData);
        yield usuario.save();
        res.json({ msg: "Cliente actualizado", cliente: usuario.cliente });
    }
    catch (err) {
        console.error("Error updateClient:", err);
        res.status(500).json({ msg: "Error interno al actualizar cliente" });
    }
});
exports.updateClient = updateClient;
// DELETE /api/clients/:id
const deleteClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const usuario = yield users_model_1.Usuario.findById(id);
        if (!usuario || usuario.rol !== "cliente") {
            res.status(404).json({ msg: "Cliente no encontrado" });
            return;
        }
        usuario.cliente = undefined;
        yield usuario.save();
        res.json({ msg: "Cliente eliminado" });
    }
    catch (err) {
        console.error("Error deleteClient:", err);
        res.status(500).json({ msg: "Error interno al eliminar cliente" });
    }
});
exports.deleteClient = deleteClient;
