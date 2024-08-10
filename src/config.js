import { config } from "dotenv"
config()

//APP's PORT
export const PORT = process.env.PORT

// MONGO DB
export const DB_HOST = process.env.DB_HOST
export const DB_DATABASE = process.env.DB_DATABASE
export const DB_PORT = process.env.DB_PORT

//JWT
export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_EXPIRES = process.env.JWT_EXPIRES
export const JWT_SECRET_PASSWORD_RECOVER = process.env.JWT_SECRET_PASSWORD_RECOVER

//EMAILER
export const EMAIL_HOST = process.env.EMAIL_HOST
export const EMAIL_PORT = process.env.EMAIL_PORT
export const EMAIL_USER = process.env.EMAIL_USER
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD