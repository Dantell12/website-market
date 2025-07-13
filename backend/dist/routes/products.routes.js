"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("../controllers/products.controller");
const uploadImage_1 = __importDefault(require("../middleware/uploadImage"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Ruta para obtener la imagen de un producto
router.get("/image/:filename", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, `../../uploads/${req.params.filename}`));
});
router.get("/", products_controller_1.getProducts);
router.get("/:id", products_controller_1.getProductById);
router.post("/", uploadImage_1.default.single("img"), products_controller_1.postProduct);
router.put("/:id", uploadImage_1.default.single("img"), products_controller_1.updateProduct);
router.delete("/:id", products_controller_1.deleteProduct);
exports.default = router;
