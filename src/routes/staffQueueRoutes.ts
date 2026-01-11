import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { ResultSetHeader } from "mysql2/promise";
import { db, pool } from "../config/database.js";
import * as schema from "../../db/schema.js";
import { buildQueueData, getDepartmentQueues } from "../services/queueService.js";
import { broadcastQueueUpdate } from "../services/websocket.js";

const router = Router();

/**
 * GET /api/staff/queues/:departmentId
 * Get all queues for a department
 */
router.get("/queues/:departmentId", async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;
    const queues = await getDepartmentQueues(parseInt(departmentId));
    res.json(queues);
  } catch (error) {
    console.error("Error in GET /api/staff/queues:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/staff/queue/create
 * Create a new queue for a patient
 */
router.post("/queue/create", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { vn, staffId } = req.body;

    if (!vn || !staffId) {
      res.status(400).json({ error: "VN and staffId required" });
      return;
    }

    // Get staff information
    const staffUser = await db.query.staff.findFirst({
      where: eq(schema.staff.staffId, staffId),
      with: { department: true },
    });

    if (!staffUser?.department) {
      res.status(400).json({ error: "Staff department not found" });
      return;
    }

    const { departmentId, departmentCode } = staffUser.department;

    // Find visit
    const visit = await db.query.visit.findFirst({
      where: eq(schema.visit.vn, vn),
    });

    if (!visit) {
      res.status(404).json({ error: "Visit not found" });
      return;
    }

    // Check if queue already exists
    const existing = await db.query.queue.findFirst({
      where: eq(schema.queue.visitId, visit.visitId),
    });

    if (existing) {
      res.status(400).json({ error: "Queue already exists for this visit" });
      return;
    }

    await connection.beginTransaction();

    // Get next queue number
    const [countResult]: any = await connection.execute(
      `SELECT COUNT(*) as count FROM queue 
       WHERE department_id = ? AND DATE(issued_time) = CURDATE() 
       FOR UPDATE`,
      [departmentId]
    );

    const nextNum = (countResult[0]?.count || 0) + 1;
    const queueNumber = `${departmentCode}${String(nextNum).padStart(3, "0")}`;

    // Insert new queue
    const [insertResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, is_skipped, priority_score) 
       VALUES (?, ?, ?, ?, 'waiting', NOW(), 0, 0)`,
      [queueNumber, visit.visitId, departmentId, randomUUID()]
    );

    const newQueueId = insertResult.insertId;

    // Log status history
    await connection.execute(
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) 
       VALUES (?, NULL, 'waiting', ?, NOW())`,
      [newQueueId, staffUser.staffName]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Queue created successfully",
      queueNumber,
      queueId: newQueueId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error in POST /api/staff/queue/create:", error);
    res.status(500).json({ error: "Failed to create queue" });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/staff/queue/:queueId/call
 * Call a queue (notify patient)
 */
router.post("/queue/:queueId/call", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { queueId } = req.params;
    const { staffName } = req.body;

    await connection.beginTransaction();

    // Get VN for broadcasting
    const [rows]: any = await connection.execute(
      `SELECT v.vn, q.status, q.queue_number 
       FROM queue q 
       JOIN visit v ON q.visit_id = v.visit_id 
       WHERE q.queue_id = ?`,
      [queueId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      res.status(404).json({ error: "Queue not found" });
      return;
    }

    const { vn, status: oldStatus, queue_number } = rows[0];

    // Update queue status
    await connection.execute(
      `UPDATE queue SET status = 'called', called_time = NOW() 
       WHERE queue_id = ?`,
      [queueId]
    );

    // Log status change
    await connection.execute(
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) 
       VALUES (?, ?, 'called', ?, NOW())`,
      [queueId, oldStatus, staffName]
    );

    // Create notification
    await connection.execute(
      `INSERT INTO notification (queue_id, notification_type, message, is_sent, sent_at) 
       VALUES (?, 'queue_called', ?, TRUE, NOW())`,
      [queueId, `คิว ${queue_number} กรุณาเข้ารับบริการ`]
    );

    await connection.commit();

    // Broadcast update via WebSocket
    const queueData = await buildQueueData(parseInt(queueId));
    broadcastQueueUpdate(vn, queueData);

    res.json({ success: true, message: "Queue called successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error in POST /api/staff/queue/:queueId/call:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/staff/queue/:queueId/arrived
 * Mark patient as arrived (in progress)
 */
router.post("/queue/:queueId/arrived", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { queueId } = req.params;
    const { staffName } = req.body;

    await connection.beginTransaction();

    const [rows]: any = await connection.execute(
      `SELECT v.vn, q.status 
       FROM queue q 
       JOIN visit v ON q.visit_id = v.visit_id 
       WHERE q.queue_id = ?`,
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
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) 
       VALUES (?, ?, 'in_progress', ?, NOW())`,
      [queueId, oldStatus, staffName]
    );

    await connection.commit();

    const queueData = await buildQueueData(parseInt(queueId));
    broadcastQueueUpdate(vn, queueData);

    res.json({ success: true, message: "Patient marked as arrived" });
  } catch (error) {
    await connection.rollback();
    console.error("Error in POST /api/staff/queue/:queueId/arrived:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/staff/queue/:queueId/skip
 * Skip a queue (patient not present)
 */
router.post("/queue/:queueId/skip", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { queueId } = req.params;
    const { staffName } = req.body;

    await connection.beginTransaction();

    // Get queue info with patient phone number
    const [rows]: any = await connection.execute(
      `SELECT v.vn, q.status, q.queue_number, p.phone_number, p.first_name, p.last_name
       FROM queue q 
       JOIN visit v ON q.visit_id = v.visit_id 
       JOIN patient p ON v.patient_id = p.patient_id
       WHERE q.queue_id = ?`,
      [queueId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      res.status(404).json({ error: "Queue not found" });
      return;
    }

    const { vn, status: oldStatus, queue_number, phone_number, first_name, last_name } = rows[0];

    // Mark as skipped and increase priority
    await connection.execute(
      `UPDATE queue 
       SET is_skipped = 1, status = 'waiting', priority_score = priority_score + 50, skipped_time = NOW()
       WHERE queue_id = ?`,
      [queueId]
    );

    await connection.execute(
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) 
       VALUES (?, ?, 'skipped', ?, NOW())`,
      [queueId, oldStatus, staffName]
    );

    // Create notification with phone number
    await connection.execute(
      `INSERT INTO notification (queue_id, notification_type, message, is_sent, sent_at) 
       VALUES (?, 'queue_skipped', ?, FALSE, NOW())`,
      [queueId, `คิว ${queue_number} ถูกข้าม - กรุณาติดต่อเจ้าหน้าที่`]
    );

    await connection.commit();

    const queueData = await buildQueueData(parseInt(queueId));
    broadcastQueueUpdate(vn, queueData);

    res.json({ 
      success: true, 
      message: "Queue skipped",
      patientInfo: {
        name: `${first_name} ${last_name}`,
        phone: phone_number,
        queueNumber: queue_number
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error in POST /api/staff/queue/:queueId/skip:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/staff/queue/:queueId/complete
 * Mark queue as completed
 */
router.post("/queue/:queueId/complete", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { queueId } = req.params;
    const { staffName } = req.body;

    await connection.beginTransaction();

    const [rows]: any = await connection.execute(
      `SELECT v.vn, q.status 
       FROM queue q 
       JOIN visit v ON q.visit_id = v.visit_id 
       WHERE q.queue_id = ?`,
      [queueId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      res.status(404).json({ error: "Queue not found" });
      return;
    }

    const { vn, status: oldStatus } = rows[0];

    await connection.execute(
      `UPDATE queue SET status = 'completed', completed_time = NOW() 
       WHERE queue_id = ?`,
      [queueId]
    );

    await connection.execute(
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) 
       VALUES (?, ?, 'completed', ?, NOW())`,
      [queueId, oldStatus, staffName]
    );

    await connection.commit();

    const queueData = await buildQueueData(parseInt(queueId));
    broadcastQueueUpdate(vn, queueData);

    res.json({ success: true, message: "Queue completed" });
  } catch (error) {
    await connection.rollback();
    console.error("Error in POST /api/staff/queue/:queueId/complete:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/staff/queue/:queueId/recall
 * Recall a skipped queue
 */
router.post("/queue/:queueId/recall", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { queueId } = req.params;
    const { staffName } = req.body;

    await connection.beginTransaction();

    const [rows]: any = await connection.execute(
      `SELECT v.vn, q.status 
       FROM queue q 
       JOIN visit v ON q.visit_id = v.visit_id 
       WHERE q.queue_id = ?`,
      [queueId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      res.status(404).json({ error: "Queue not found" });
      return;
    }

    const { vn, status: oldStatus } = rows[0];

    // Unmark as skipped and give high priority
    await connection.execute(
      `UPDATE queue 
       SET is_skipped = 0, status = 'waiting', priority_score = priority_score + 100 
       WHERE queue_id = ?`,
      [queueId]
    );

    await connection.execute(
      `INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at) 
       VALUES (?, ?, 'recalled', ?, NOW())`,
      [queueId, oldStatus, staffName]
    );

    await connection.commit();

    const queueData = await buildQueueData(parseInt(queueId));
    broadcastQueueUpdate(vn, queueData);

    res.json({ success: true, message: "Queue recalled successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error in POST /api/staff/queue/:queueId/recall:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});

export default router;