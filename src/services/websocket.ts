import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

const connections = new Map<string, Set<WebSocket>>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({
    server,
    clientTracking: true,
    perMessageDeflate: false,
  });

  // Heartbeat interval to detect dead connections
  const wsInterval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(wsInterval);
  });

  wss.on("connection", (ws: any) => {
    let currentVN: string | null = null;
    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    console.log("🔌 New WebSocket connection");

    ws.on("message", (message: any) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "subscribe" && data.vn) {
          // Unsubscribe from previous VN
          if (currentVN && connections.has(currentVN)) {
            connections.get(currentVN)?.delete(ws);
            if (connections.get(currentVN)?.size === 0) {
              connections.delete(currentVN);
            }
          }

          // Subscribe to new VN
          currentVN = data.vn;
          if (currentVN) {
            if (!connections.has(currentVN)) {
              connections.set(currentVN, new Set());
            }
            connections.get(currentVN)?.add(ws);
            console.log(`✅ Client subscribed to VN: ${currentVN}`);

            ws.send(
              JSON.stringify({
                type: "subscribed",
                vn: currentVN,
                timestamp: new Date().toISOString(),
              })
            );
          }
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });

    ws.on("close", () => {
      if (currentVN && connections.has(currentVN)) {
        connections.get(currentVN)?.delete(ws);
        if (connections.get(currentVN)?.size === 0) {
          connections.delete(currentVN);
        }
      }
    });
  });

  return wss;
}

export function broadcastQueueUpdate(vn: string, queueData: any) {
  if (!connections.has(vn)) return;

  const message = JSON.stringify({
    type: "queue_update",
    data: queueData,
    timestamp: new Date().toISOString(),
  });

  const deadSockets: WebSocket[] = [];
  connections.get(vn)?.forEach((ws) => {
    try {
      if (ws.readyState === 1) {
        ws.send(message);
      } else {
        deadSockets.push(ws);
      }
    } catch (err) {
      deadSockets.push(ws);
    }
  });

  // Clean up dead connections
  deadSockets.forEach((ws) => connections.get(vn)?.delete(ws));
}