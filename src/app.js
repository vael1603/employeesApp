import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import cors from 'cors'
import { DB_HOST, DB_DATABASE, DB_PORT } from './config.js';
import authRoutes from './Routes/Auth.routes.js';
import employeeRoutes from './Routes/Employee.routes.js';
import positionRoutes from './Routes/Position.route.js';

const connection = `mongodb+srv://admin:e4tmoak7J8oZSBr8@clusteremployapp.ptiq9.mongodb.net/employeeApp?retryWrites=true&w=majority&appName=ClusterEmployApp`

mongoose.connect(connection).then()

const app = express()
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(authRoutes)
app.use(employeeRoutes)
app.use(positionRoutes)

app.get('/', (req, res) => {
  res.send('Hello World')
});

export default app