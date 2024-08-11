import { Router } from 'express';
import { createUser, login, logout, passwordRecover, updatePassword } from '../Controllers/AuthController.js';

const authRoutes = Router()

authRoutes.post('/api/users', createUser)
authRoutes.post('/api/login', login)
authRoutes.post('/api/logout', logout)
authRoutes.post('/api/recoverPassword', passwordRecover)
authRoutes.post('/api/updatePassword/:token', updatePassword)

export default authRoutes