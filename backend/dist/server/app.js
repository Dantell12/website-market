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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const conection_1 = __importDefault(require("../config/conection"));
const user_routes_1 = __importDefault(require("../routes/user.routes"));
const client_routes_1 = __importDefault(require("../routes/client.routes"));
const products_routes_1 = __importDefault(require("../routes/products.routes"));
const reports_routes_1 = __importDefault(require("../routes/reports.routes"));
const cart_routes_1 = __importDefault(require("../routes/cart.routes"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || "1880";
        this.middlewares();
        this.connectDatabase()
            .then(() => {
            this.routes();
            this.listen();
        })
            .catch(err => {
            console.error("❌ Falló la conexión a MongoDB:", err);
        });
    }
    connectDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("⏳ Iniciando conexión a MongoDB...");
            yield (0, conection_1.default)();
            console.log("✅ MongoDB conectado.");
        });
    }
    middlewares() {
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)({
            origin: ["http://localhost:5173"],
            allowedHeaders: ["Content-Type", "Authorization"],
            exposedHeaders: ["Authorization"],
        }));
    }
    routes() {
        this.app.use("/api/users", user_routes_1.default);
        this.app.use("/api/clients", client_routes_1.default);
        this.app.use("/api/products", products_routes_1.default);
        this.app.use("/api/reports", reports_routes_1.default);
        this.app.use("/api/cart", cart_routes_1.default);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 API corriendo en http://localhost:${this.port}`);
        });
    }
}
exports.default = App;
