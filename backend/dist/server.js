"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server/server.ts
const app_1 = __importDefault(require("./server/app"));
// Instancio mi clase App; el constructor ya monta todo y hace .listen()
new app_1.default();
