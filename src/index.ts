import "dotenv/config";

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema.js"; 
import { randomUUID } from "crypto";
import { type ResultSetHeader } from "mysql2/promise";

const app = express();
const server = createServer(app);
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "mydb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = drizzle(pool, { schema, mode: "default" });
console.log("✅ Database connected successfully");

// WebSocket Setup
const wss = new WebSocketServer({
  server,
  clientTracking: true,
  perMessageDeflate: false,
});

const connections = new Map<string, Set<WebSocket>>();

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
        if (currentVN && connections.has(currentVN)) {
          connections.get(currentVN)?.delete(ws);
          if (connections.get(currentVN)?.size === 0) {
            connections.delete(currentVN);
          }
        }

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

function broadcastQueueUpdate(vn: string, queueData: any) {
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

  deadSockets.forEach((ws) => connections.get(vn)?.delete(ws));
}

// Helper Function: ดึงข้อมูลเอง 100% ไม่ต้องรอรับ Parameter
async function buildQueueData(queueId: number) {
  const connection = await pool.getConnection();
  try {
    // 1. ดึงข้อมูลคิว + Department ID มาใหม่สดๆ
    const [rows]: any = await connection.execute(
      `SELECT 
        q.queue_id, q.queue_number, q.status, q.issued_time, 
        q.is_skipped, q.priority_score, q.department_id, 
        v.vn,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        d.department_name, d.building, d.floor, d.room
      FROM queue q
      JOIN visit v ON q.visit_id = v.visit_id
      JOIN patient p ON v.patient_id = p.patient_id
      JOIN department d ON q.department_id = d.department_id
      WHERE q.queue_id = ?`,
      [queueId]
    );

    if (rows.length === 0) throw new Error("Queue not found");
    const queueInfo = rows[0];

    // 2. ใช้ข้อมูลที่ดึงมา (queueInfo) ในการคำนวณต่อ (รับรองว่ามีค่าแน่นอน)
    const [currentRows]: any = await connection.execute(
      `SELECT queue_number FROM queue
       WHERE department_id = ? AND status = 'called'
       ORDER BY called_time DESC LIMIT 1`,
      [queueInfo.department_id]
    );

    const [posRows]: any = await connection.execute(
      `SELECT COUNT(*) as position FROM queue
       WHERE department_id = ? AND status = 'waiting' AND is_skipped = FALSE
       AND (priority_score > ? OR (priority_score = ? AND issued_time < ?))`,
      [
        queueInfo.department_id,
        queueInfo.priority_score,
        queueInfo.priority_score,
        queueInfo.issued_time,
      ]
    );

    const yourPosition = posRows[0].position;
    const estimatedTime =
      yourPosition >= 0
        ? `${(yourPosition + 1) * 5}-${(yourPosition + 1) * 7} นาที`
        : "กรุณาเข้ารับบริการ";

    return {
      queueNumber: queueInfo.queue_number,
      vn: queueInfo.vn,
      patientName: queueInfo.patient_name,
      department: queueInfo.department_name,
      departmentLocation: `${queueInfo.building} ${queueInfo.floor || ""} ${
        queueInfo.room || ""
      }`,
      status: queueInfo.status,
      currentQueue: currentRows[0]?.queue_number || queueInfo.queue_number,
      yourPosition: Math.max(0, yourPosition),
      estimatedTime,
      issuedTime: new Date(queueInfo.issued_time).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      priorityScore: queueInfo.priority_score,
      isSkipped: Boolean(queueInfo.is_skipped),
    };
  } finally {
    connection.release();
  }
}

// ==================== ROUTES ====================

// 1. Get Queue by VN
app.get("/api/queue/:vn", async (req: Request, res: Response) => {
  try {
    const { vn } = req.params;
    const visit = await db.query.visit.findFirst({
      where: eq(schema.visit.vn, vn),
      with: {
        patient: true,
        queue: { with: { department: true } },
      },
    });

    if (!visit || !visit.queue) {
      res.status(404).json({ error: "Queue not found" });
      return;
    }

    const queueData = await buildQueueData(visit.queue.queueId);
    res.json(queueData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Staff Login
app.post("/api/staff/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const staffUser = await db.query.staff.findFirst({
      where: eq(schema.staff.username, username),
      with: { department: true },
    });

    if (!staffUser || staffUser.password !== password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    res.json({
      success: true,
      staffId: staffUser.staffId,
      staffName: staffUser.staffName,
      role: staffUser.role,
      departmentId: staffUser.departmentId,
      departmentName: staffUser.department?.departmentName,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Get Staff Queues
app.get(
  "/api/staff/queues/:departmentId",
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const connection = await pool.getConnection();
      try {
        const [queues]: any = await connection.execute(
          `SELECT q.queue_id, q.queue_number, q.status, q.issued_time, q.is_skipped, q.priority_score,
                v.vn, CONCAT(p.first_name, ' ', p.last_name) as patient_name
         FROM queue q
         JOIN visit v ON q.visit_id = v.visit_id
         JOIN patient p ON v.patient_id = p.patient_id
         WHERE q.department_id = ? AND DATE(q.issued_time) = CURDATE()
         ORDER BY q.priority_score DESC, q.issued_time ASC`,
          [departmentId]
        );

        res.json(
          queues.map((q: any) => ({
            queueId: q.queue_id,
            queueNumber: q.queue_number,
            patientName: q.patient_name,
            vn: q.vn,
            status: q.status,
            issuedTime: new Date(q.issued_time).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isSkipped: Boolean(q.is_skipped),
            priorityScore: q.priority_score,
          }))
        );
      } finally {
        connection.release();
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// 4. Create Queue (Fixed: No Stored Procedure)
app.post(
  "/api/staff/queue/create",
  async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      const { vn, staffId } = req.body;

      const staffUser = await db.query.staff.findFirst({
        where: eq(schema.staff.staffId, staffId),
        with: { department: true },
      });

      if (!staffUser?.department) {
        res.status(400).json({ error: "Staff department not found" });
        return;
      }

      const { departmentId, departmentCode } = staffUser.department;

      const visit = await db.query.visit.findFirst({
        where: eq(schema.visit.vn, vn),
      });
      if (!visit) {
        res.status(404).json({ error: "Visit not found" });
        return;
      }

      const existing = await db.query.queue.findFirst({
        where: eq(schema.queue.visitId, visit.visitId),
      });
      if (existing) {
        res.status(400).json({ error: "Queue already exists" });
        return;
      }

      await connection.beginTransaction();

      const [countResult]: any = await connection.execute(
        `SELECT COUNT(*) as count FROM queue WHERE department_id = ? AND DATE(issued_time) = CURDATE() FOR UPDATE`,
        [departmentId]
      );
      const nextNum = (countResult[0]?.count || 0) + 1;
      const queueNumber = `${departmentCode}${String(nextNum).padStart(3, "0")}`;

      const [insertResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, is_skipped, priority_score) 
       VALUES (?, ?, ?, ?, 'waiting', NOW(), 0, 0)`,
        [queueNumber, visit.visitId, departmentId, randomUUID()]
      );

      const newQueueId = insertResult.insertId;

      await connection.execute(
        `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) 
       VALUES (?, NULL, 'waiting', ?, NOW())`,
        [newQueueId, staffUser.staffName]
      );

      await connection.commit();
      res.json({
        success: true,
        message: "Queue created",
        queueNumber,
        queueId: newQueueId,
      });
    } catch (error) {
      await connection.rollback();
      console.error(error);
      res.status(500).json({ error: "Failed to create queue" });
    } finally {
      connection.release();
    }
  }
);

// 5. Call Queue
app.post("/api/staff/queue/:queueId/call", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { queueId } = req.params;
    const { staffName } = req.body;

    await connection.beginTransaction();
    
    // ดึง VN เพื่อใช้ Broadcast
    const [rows]: any = await connection.execute(
        `SELECT v.vn, q.status, q.queue_number FROM queue q 
         JOIN visit v ON q.visit_id = v.visit_id WHERE q.queue_id = ?`,
        [queueId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      res.status(404).json({ error: "Queue not found" });
      return;
    }
    const { vn, status: oldStatus, queue_number } = rows[0];

    await connection.execute(
      `UPDATE queue SET status = 'called', called_time = NOW() WHERE queue_id = ?`,
      [queueId]
    );
    await connection.execute(
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) VALUES (?, ?, 'called', ?, NOW())`,
      [queueId, oldStatus, staffName]
    );
    await connection.execute(
      `INSERT INTO notification (queue_id, notification_type, message, is_sent, sent_at) VALUES (?, 'queue_called', ?, TRUE, NOW())`,
      [queueId, `คิว ${queue_number} กรุณาเข้ารับบริการ`]
    );

    await connection.commit();

    const queueData = await buildQueueData(parseInt(queueId));
    broadcastQueueUpdate(vn, queueData);

    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

// 6. Patient Arrived (New Status: in_progress)
app.post("/api/staff/queue/:queueId/arrived", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { queueId } = req.params;
    const { staffName } = req.body;

    await connection.beginTransaction();
    
    const [rows]: any = await connection.execute(
        `SELECT v.vn, q.status FROM queue q JOIN visit v ON q.visit_id = v.visit_id WHERE q.queue_id = ?`,
        [queueId]
    );

    if (rows.length === 0) {
        await connection.rollback();
        res.status(404).json({ error: "Queue not found" });
        return;
    }
    const { vn, status: oldStatus } = rows[0];

    await connection.execute(
      `UPDATE queue SET status = 'in_progress' WHERE queue_id = ?`,
      [queueId]
    );
    await connection.execute(
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) VALUES (?, ?, 'in_progress', ?, NOW())`,
      [queueId, oldStatus, staffName]
    );

    await connection.commit();

    const queueData = await buildQueueData(parseInt(queueId));
    broadcastQueueUpdate(vn, queueData);

    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error("Error in /arrived:", error); 
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

// 7. Skip Queue
app.post("/api/staff/queue/:queueId/skip", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { queueId } = req.params;
    const { staffName } = req.body;

    await connection.beginTransaction();
    
    const [rows]: any = await connection.execute(
        `SELECT v.vn, q.status FROM queue q JOIN visit v ON q.visit_id = v.visit_id WHERE q.queue_id = ?`,
        [queueId]
    );

    if (rows.length === 0) {
        await connection.rollback();
        res.status(404).json({ error: "Queue not found" });
        return;
    }
    const { vn, status: oldStatus } = rows[0];

    // เปลี่ยน status เป็น 'waiting' และ set is_skipped = 1
    await connection.execute(
      `UPDATE queue SET is_skipped = 1, status = 'waiting', priority_score = priority_score + 50 WHERE queue_id = ?`,
      [queueId]
    );
    await connection.execute(
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) VALUES (?, ?, 'skipped', ?, NOW())`,
      [queueId, oldStatus, staffName]
    );

    await connection.commit();

    const queueData = await buildQueueData(parseInt(queueId));
    broadcastQueueUpdate(vn, queueData);

    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

// 8. Complete Queue
app.post("/api/staff/queue/:queueId/complete", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { queueId } = req.params;
    const { staffName } = req.body;

    await connection.beginTransaction();
    
    const [rows]: any = await connection.execute(
        `SELECT v.vn, q.status FROM queue q JOIN visit v ON q.visit_id = v.visit_id WHERE q.queue_id = ?`,
        [queueId]
    );

    if (rows.length === 0) {
        await connection.rollback();
        res.status(404).json({ error: "Queue not found" });
        return;
    }
    const { vn, status: oldStatus } = rows[0];

    await connection.execute(
      `UPDATE queue SET status = 'completed', completed_time = NOW() WHERE queue_id = ?`,
      [queueId]
    );
    await connection.execute(
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) VALUES (?, ?, 'completed', ?, NOW())`,
      [queueId, oldStatus, staffName]
    );

    await connection.commit();

    const queueData = await buildQueueData(parseInt(queueId));
    broadcastQueueUpdate(vn, queueData);

    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

// 9. Recall Queue
app.post("/api/staff/queue/:queueId/recall", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { queueId } = req.params;
    const { staffName } = req.body;

    await connection.beginTransaction();
    
    const [rows]: any = await connection.execute(
        `SELECT v.vn, q.status FROM queue q JOIN visit v ON q.visit_id = v.visit_id WHERE q.queue_id = ?`,
        [queueId]
    );

    if (rows.length === 0) {
        await connection.rollback();
        res.status(404).json({ error: "Queue not found" });
        return;
    }
    const { vn, status: oldStatus } = rows[0];

    await connection.execute(
      `UPDATE queue SET is_skipped = 0, status = 'waiting', priority_score = priority_score + 100 WHERE queue_id = ?`,
      [queueId]
    );
    await connection.execute(
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) VALUES (?, ?, 'recalled', ?, NOW())`,
      [queueId, oldStatus, staffName]
    );

    await connection.commit();

    const queueData = await buildQueueData(parseInt(queueId));
    broadcastQueueUpdate(vn, queueData);

    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

process.on("SIGTERM", async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});