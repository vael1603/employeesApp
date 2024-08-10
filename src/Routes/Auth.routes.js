import { Router } from 'express';
import { createUser, login, logout } from '../Controllers/AuthController.js';

const authRoutes = Router()

authRoutes.post('/api/users', createUser)
authRoutes.post('/api/login', login)
authRoutes.post('/api/logout', logout)

export default authRoutes