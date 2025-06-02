import express from "express";
import cors from "cors";
import sequelize from "../config/conection";
import dotenv from "dotenv";
dotenv.config();

import userRouter from "../routes/user.routes";
import clientRouter from "../routes/client.routes";
import productRouter from "../routes/products.routes";
import cartRouter from "../routes/cart.routes"
import salesRoutes from "../routes/sales.routes"
import reportsRoutes from "../routes/reports.routes"
class app {
  private app: express.Application;
  private port: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || "1880";
    this.listen();
    this.midlewares();
    this.routes();
    this.backendConnect();
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("Servicio de Red/es corriendo en el puerto: " + this.port);
    });
  }
  routes() {
    /**
     * Route backend User
     */

    this.app.use("/api/users", userRouter);
    this.app.use("/api/clients", clientRouter);
    this.app.use("/api/products", productRouter);
    this.app.use("/api/carts", cartRouter);
    this.app.use("/api/sales", salesRoutes);
    this.app.use("/api/reports", reportsRoutes);
  }
  midlewares() {
    this.app.use(express.json());

    //cors
    this.app.use(
      cors({
        origin: ["http://localhost:5173"], // o tu dominio
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Authorization"],
      })
    );
  }

  async backendConnect() {
    try {
      await sequelize.authenticate();
      console.log(
        "\n",
        "\x1b[32m",
        "CONNECTION WITH THE DATABASE WORKING",
        "\x1b[0m",
        "\n"
      );
      console.log(
        "\n",
        "\x1b[32m",
        "BACKEND NETWORK SERVICES FROM iCONTROL IS WORKING!",
        "\x1b[0m",
        "\n"
      );
    } catch (error) {
      console.error(
        "\n",
        "\x1b[31m",
        "BACKEND NETWORK SERVICES FROM iCONTROL FAILED TO START!: ",
        error,
        "\x1b[0m",
        "\n"
      );
    }
  }
}

export default app;
