import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import Debug from "debug";
import type { ErrorRequestHandler } from "express";
import { sql } from "drizzle-orm";
import { dbClient } from "@db/client.js";
import { pool } from "@db/client.js";
 import { queues } from "@db/schema.js"; 

const debug = Debug("nakornpingQ-backend");

// Initialize express app
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.get("/health/db", async (_req, res) => {
  try {
    const [rows] = await pool.promise().query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: String(err),
    });
  }
});


app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ===== Middleware =====
app.use(morgan("dev"));
app.use(helmet());

app.use(express.json());

// ===== Error Middleware (ต้องอยู่ล่างสุด) =====
const jsonErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  debug(err.message);
  res.status(500).json({
    message: err.message || "Internal Server Error",
    type: err.name || "Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

app.use(jsonErrorHandler);

// ===== Start server =====
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
