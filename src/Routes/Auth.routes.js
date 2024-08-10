import { Router } from 'express';
import { createUser } from '../Controllers/AuthController.js';

const authRoutes = Router()

authRoutes.post('/api/users', createUser)

export default authRoutes