import { createServer } from "http";
import app from "./app.js";
import { testConnection, pool } from "./config/database.js";
import { setupWebSocket } from "./services/websocket.js";

const server = createServer(app);
const PORT = Number(process.env.PORT) || 3000;

await testConnection();

setupWebSocket(server);
console.log("✅ WebSocket server initialized");

process.on("SIGTERM", async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
