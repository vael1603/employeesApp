import { config } from "dotenv";
config();

//APP's PORT
export const PORT = process.env.PORT;

// MONGO DB
export const DB_HOST = process.env.DB_HOST;
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_PORT = process.env.DB_PORT;

//JWT
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES = process.env.JWT_EXPIRES;