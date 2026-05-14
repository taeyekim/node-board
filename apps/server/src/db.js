import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? { connectionString }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || "board_user",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "board_app",
      },
);

export async function closePool() {
  await pool.end();
}
