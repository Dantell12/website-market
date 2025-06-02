import { Router } from "express";
import {
  getClient,
  getClientById,
  postClient,
  updateClient,
  deleteClient,
} from "../controllers/client.controller";
import validateToken from "../middleware/validateToken";


const router = Router();

router.get("/", validateToken,getClient);
router.get("/:id",validateToken, getClientById);
router.post("/", validateToken,postClient);
router.put("/:id",validateToken,  updateClient);
router.delete("/:id",validateToken, deleteClient);

export default router;
