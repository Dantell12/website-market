"use strict";
// src/controllers/clients.controller.ts
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
exports.deleteClient = exports.updateClient = exports.postClient = exports.getClientById = exports.getClient = void 0;
const clients_model_1 = require("../models/clients.model");
/**
 * Metodo getClient
 * Devuelve lista de todos los clientes
 */
const getClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listClients = yield clients_model_1.ClienteModel.findAll();
        if (listClients.length > 0) {
            res.json(listClients);
        }
        else {
            res.status(404).json({
                msg: "No se ha encontrado ningún cliente",
            });
        }
    }
    catch (error) {
        console.error("Error al obtener lista de clientes:", error);
        res.status(500).json({
            msg: "Error al obtener lista de clientes",
        });
    }
});
exports.getClient = getClient;
/**
 * Metodo getClientById
 * Devuelve un cliente por su ID
 */
const getClientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const client = yield clients_model_1.ClienteModel.findByPk(id);
        if (client) {
            res.json(client);
        }
        else {
            res.status(404).json({
                msg: `No existe un cliente con el id: ${id}`,
            });
        }
    }
    catch (error) {
        console.error(`Error al obtener cliente ${id}:`, error);
        res.status(500).json({
            msg: "Error al obtener el cliente",
        });
    }
});
exports.getClientById = getClientById;
/**
 * Metodo postClient
 * Crea un nuevo cliente
 */
const postClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, apellido, cedula, direccion, id_usuario } = req.body;
        // Validar campos obligatorios
        if (!nombre || !apellido || !cedula) {
            res.status(400).json({
                msg: "Faltan datos obligatorios: nombre, apellido o cédula",
            });
        }
        // Verificar unicidad de cédula
        const exists = yield clients_model_1.ClienteModel.findOne({ where: { cedula } });
        if (exists) {
            res.status(400).json({
                msg: `La cédula ${cedula} ya está registrada`,
            });
        }
        const newClient = yield clients_model_1.ClienteModel.create({
            nombre,
            apellido,
            cedula,
            direccion: direccion !== null && direccion !== void 0 ? direccion : null,
            id_usuario: id_usuario !== null && id_usuario !== void 0 ? id_usuario : null,
        });
        res.status(201).json({
            msg: "Cliente creado correctamente",
            client: newClient,
        });
    }
    catch (error) {
        console.error("Error al registrar cliente:", error);
        res.status(500).json({
            msg: "Error al registrar cliente",
        });
    }
});
exports.postClient = postClient;
/**
 * Metodo updateClient
 * Actualiza un cliente existente
 */
const updateClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nombre, apellido, cedula, direccion, id_usuario } = req.body;
    try {
        const client = yield clients_model_1.ClienteModel.findByPk(id);
        if (!client) {
            res.status(404).json({
                msg: `No existe un cliente con id: ${id}`,
            });
            return;
        }
        // Si la cédula cambia, verificar que no choque con otra
        if (cedula && cedula !== client.get("cedula")) {
            const cedulaExists = yield clients_model_1.ClienteModel.findOne({ where: { cedula } });
            if (cedulaExists) {
                res.status(400).json({
                    msg: `La cédula ${cedula} ya está registrada en otro cliente`,
                });
                return;
            }
        }
        yield client.update({
            nombre: nombre !== null && nombre !== void 0 ? nombre : client.get("nombre"),
            apellido: apellido !== null && apellido !== void 0 ? apellido : client.get("apellido"),
            cedula: cedula !== null && cedula !== void 0 ? cedula : client.get("cedula"),
            direccion: direccion !== undefined ? direccion : client.get("direccion"),
            id_usuario: id_usuario !== undefined ? id_usuario : client.get("id_usuario"),
        });
        res.json({
            msg: "Cliente actualizado correctamente",
            client,
        });
    }
    catch (error) {
        console.error(`Error al actualizar cliente ${id}:`, error);
        res.status(500).json({
            msg: "Error al actualizar cliente",
        });
    }
});
exports.updateClient = updateClient;
/**
 * Metodo deleteClient
 * Elimina físicamente un cliente
 */
const deleteClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedCount = yield clients_model_1.ClienteModel.destroy({ where: { id_cliente: id } });
        if (deletedCount === 0) {
            res.status(404).json({
                msg: `No existe un cliente con id: ${id}`,
            });
        }
        res.json({
            msg: "Cliente eliminado correctamente",
        });
    }
    catch (error) {
        console.error(`Error al eliminar cliente ${id}:`, error);
        res.status(500).json({
            msg: "Error al eliminar cliente",
        });
    }
});
exports.deleteClient = deleteClient;
