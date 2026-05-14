import { pool } from "./db.js";

export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
