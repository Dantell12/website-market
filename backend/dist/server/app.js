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
const conection_1 = __importDefault(require("../config/conection"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_routes_1 = __importDefault(require("../routes/user.routes"));
const client_routes_1 = __importDefault(require("../routes/client.routes"));
const products_routes_1 = __importDefault(require("../routes/products.routes"));
const cart_routes_1 = __importDefault(require("../routes/cart.routes"));
const sales_routes_1 = __importDefault(require("../routes/sales.routes"));
const reports_routes_1 = __importDefault(require("../routes/reports.routes"));
class app {
    constructor() {
        this.app = (0, express_1.default)();
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
        this.app.use("/api/users", user_routes_1.default);
        this.app.use("/api/clients", client_routes_1.default);
        this.app.use("/api/products", products_routes_1.default);
        this.app.use("/api/carts", cart_routes_1.default);
        this.app.use("/api/sales", sales_routes_1.default);
        this.app.use("/api/reports", reports_routes_1.default);
    }
    midlewares() {
        this.app.use(express_1.default.json());
        //cors
        this.app.use((0, cors_1.default)({
            origin: ["http://localhost:5173"], // o tu dominio
            allowedHeaders: ["Content-Type", "Authorization"],
            exposedHeaders: ["Authorization"],
        }));
    }
    backendConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield conection_1.default.authenticate();
                console.log("\n", "\x1b[32m", "CONNECTION WITH THE DATABASE WORKING", "\x1b[0m", "\n");
                console.log("\n", "\x1b[32m", "BACKEND NETWORK SERVICES FROM iCONTROL IS WORKING!", "\x1b[0m", "\n");
            }
            catch (error) {
                console.error("\n", "\x1b[31m", "BACKEND NETWORK SERVICES FROM iCONTROL FAILED TO START!: ", error, "\x1b[0m", "\n");
            }
        });
    }
}
exports.default = app;
