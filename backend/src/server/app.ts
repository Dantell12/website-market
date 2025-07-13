import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Carga variables de entorno
dotenv.config();

// Importa módulos
import connectDB from "../config/conection";
import userRouter from "../routes/user.routes";
import clientRouter from "../routes/client.routes";
import productRouter from "../routes/products.routes";
import reportsRouter from "../routes/reports.routes";
import cartRouter from "../routes/cart.routes";

export default class App {
  public app: express.Application;
  private port: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || "1880";

    this.middlewares();
    this.connectDatabase()
      .then(() => {
        this.routes();
        this.listen();
      })
      .catch((err) => {
        console.error("❌ Falló la conexión a MongoDB:", err);
      });
  }

  private async connectDatabase() {
    console.log("⏳ Iniciando conexión a MongoDB...");
    await connectDB();
    console.log("✅ MongoDB conectado.");
  }

  private middlewares() {
    // Habilita CORS solo para el frontend
    this.app.use(
      cors({
        origin: ["http://localhost:5173"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Authorization"],
      })
    );

    // Habilita lectura de JSON y formularios
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Servir imágenes desde /api/uploads
    const uploadsPath = path.resolve("uploads");
    console.log("🖼️ Sirviendo imágenes desde:", uploadsPath);

    this.app.use(
      "/api/uploads",
      express.static(uploadsPath)
    );
  }

  private routes() {
    this.app.use("/api/users", userRouter);
    this.app.use("/api/clients", clientRouter);
    this.app.use("/api/products", productRouter);
    this.app.use("/api/reports", reportsRouter);
    this.app.use("/api/cart", cartRouter);
  }

  private listen() {
    this.app.listen(this.port, () => {
      console.log(`🚀 API corriendo en http://localhost:${this.port}`);
    });
  }
}
