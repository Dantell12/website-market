"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("../controllers/products.controller");
const validateToken_1 = __importDefault(require("../middleware/validateToken"));
const router = (0, express_1.Router)();
router.get("/", validateToken_1.default, products_controller_1.getProducts);
router.get("/:id", validateToken_1.default, products_controller_1.getProductById);
router.post("/", validateToken_1.default, products_controller_1.postProduct);
router.put("/:id", validateToken_1.default, products_controller_1.updateProduct);
router.delete("/:id", validateToken_1.default, products_controller_1.deleteProduct);
exports.default = router;
