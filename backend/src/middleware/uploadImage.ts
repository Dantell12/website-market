import multer from "multer";
import path from "path";
import { Request } from "express";

// Configuración mejorada de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("uploads"));  // 👈 debe coincidir
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `producto-${Date.now()}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG)"));
  }
};

// Límite de tamaño: 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;