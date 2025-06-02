// src/routes/user.routes.ts
import { Router } from 'express';
import { loginUser, newUser } from '../controllers/user.controller';

const router = Router();

router.post('/login', loginUser);  
router.post('/', newUser);      

export default router;
