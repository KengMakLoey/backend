import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import patientRoutes from "./routes/patientRoutes.js";
import staffAuthRoutes from "./routes/staffAuthRoutes.js";
import staffQueueRoutes from "./routes/staffQueueRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/api/queue", patientRoutes);
app.use("/api/staff", staffAuthRoutes);
app.use("/api/staff", staffQueueRoutes);

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

export default app;
