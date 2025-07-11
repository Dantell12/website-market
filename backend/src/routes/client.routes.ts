import { Router } from "express";

import validateToken from "../middleware/validateToken";
import { deleteClient, getClientById, getClients, updateClient } from "../controllers/client.controller";


const router = Router();

router.get("/", validateToken,getClients);
router.get("/:id",validateToken, getClientById);
router.put("/:id",validateToken,  updateClient);
router.delete("/:id",validateToken, deleteClient);

export default router;
