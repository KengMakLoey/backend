import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";
import { testConnection, pool } from "./config/database.js";
import { setupWebSocket } from "./services/websocket.js";
import patientRoutes from "./routes/patientRoutes.js";
import staffAuthRoutes from "./routes/staffAuthRoutes.js";
import staffQueueRoutes from "./routes/staffQueueRoutes.js";

const app = express();
const server = createServer(app);
const PORT = Number(process.env.PORT) || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== DATABASE ====================
await testConnection();

// ==================== WEBSOCKET ====================
setupWebSocket(server);
console.log("✅ WebSocket server initialized");

// ==================== ROUTES ====================
// Patient routes
app.use("/api/queue", patientRoutes);

// Staff authentication
app.use("/api/staff", staffAuthRoutes);

// Staff queue management
app.use("/api/staff", staffQueueRoutes);

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// ==================== ERROR HANDLING ====================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    await pool.end();
    console.log("Database pool closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    await pool.end();
    console.log("Database pool closed");
    process.exit(0);
  });
});

// ==================== START SERVER ====================
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}`);
});