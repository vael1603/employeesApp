import { Router } from 'express';
import { getPositions } from '../Controllers/PositionsController.js';

const positionRoutes = Router()

positionRoutes.get('/api/positions', getPositions)

export default positionRoutes