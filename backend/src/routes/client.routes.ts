import { Router } from "express";

import validateToken from "../middleware/validateToken";
import { deleteClient, getClientById, getClients, postClient, updateClient } from "../controllers/client.controller";


const router = Router();

router.get("/", validateToken,getClients);
router.get("/:id",validateToken, getClientById);
router.post("/", validateToken, postClient);
router.put("/:id",validateToken,  updateClient);
router.delete("/:id",validateToken, deleteClient);

export default router;
