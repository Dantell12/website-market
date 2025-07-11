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
exports.deleteClient = exports.updateClient = exports.getClientById = exports.getClients = void 0;
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
