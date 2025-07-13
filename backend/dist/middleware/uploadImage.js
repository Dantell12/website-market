"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configuración mejorada de almacenamiento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.resolve("uploads")); // 👈 debe coincidir
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `producto-${Date.now()}${ext}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG)"));
    }
};
// Límite de tamaño: 5MB
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});
exports.default = upload;
