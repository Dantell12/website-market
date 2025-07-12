"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateToken_1 = __importDefault(require("../middleware/validateToken"));
const client_controller_1 = require("../controllers/client.controller");
const router = (0, express_1.Router)();
router.get("/", validateToken_1.default, client_controller_1.getClients);
router.get("/:id", validateToken_1.default, client_controller_1.getClientById);
router.post("/", validateToken_1.default, client_controller_1.postClient);
router.put("/:id", validateToken_1.default, client_controller_1.updateClient);
router.delete("/:id", validateToken_1.default, client_controller_1.deleteClient);
exports.default = router;
