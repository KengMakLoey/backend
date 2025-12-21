import mysql from "mysql2";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@db/schema.js";

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER ?? "appuser",
  password: process.env.DB_PASSWORD ?? "apppass",
  database: process.env.DB_NAME ?? "mydb",
});

export const dbClient = drizzle<typeof schema>(pool, {
  schema,
  mode: "default",
  logger: process.env.NODE_ENV !== "production",
});
