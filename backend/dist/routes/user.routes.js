"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.post('/login', user_controller_1.loginUser);
router.post('/register', user_controller_1.registerUser);
exports.default = router;
