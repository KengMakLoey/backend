import { pool } from "../config/database.js";
import type { RequestHandler } from "express";

function formatDepartmentLocation(
  building?: string,
  floor?: string,
  room?: string
): string {
  const parts: string[] = [];

  if (building) parts.push(building);
  if (floor) parts.push(floor);
  if (room) parts.push(`ห้อง ${room.replace(/^ห้อง\s*/i, "")}`);

  return parts.join(" ");
}

/**
 * Build complete queue data by fetching fresh data from database
 * This ensures we always have the most up-to-date information
 */
export async function buildQueueData(queueId: number) {
  const connection = await pool.getConnection();
  try {
    // 1. Get queue info with department details
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

    if (rows.length === 0) {
      throw new Error("Queue not found");
    }

    const queueInfo = rows[0];

    // 2. Get current queue being called in this department
    const [currentRows]: any = await connection.execute(
      `SELECT queue_number FROM queue
       WHERE department_id = ? AND status = 'called'
       ORDER BY called_time DESC LIMIT 1`,
      [queueInfo.department_id]
    );

    // 3. Calculate position in queue
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
    /*const estimatedTime =
      yourPosition >= 0
        ? `${(yourPosition + 1) * 5}-${(yourPosition + 1) * 7} นาที`
        : "กรุณาเข้ารับบริการ";*/

    return {
      queueNumber: queueInfo.queue_number,
      vn: queueInfo.vn,
      patientName: queueInfo.patient_name,
      department: queueInfo.department_name,
      departmentLocation: formatDepartmentLocation(
        queueInfo.building,
        queueInfo.floor,
        queueInfo.room
      ),
      status: queueInfo.status,
      currentQueue: currentRows[0]?.queue_number || queueInfo.queue_number,
      yourPosition: Math.max(0, yourPosition),
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

export const getQueueByPhone: RequestHandler = async (req, res) => {
  const { phone } = req.params;

  const connection = await pool.getConnection();
  try {
    const [patientRows]: any = await connection.execute(
      `SELECT patient_id, first_name, last_name
       FROM patient
       WHERE phone_number = ?`,
      [phone]
    );

    if (patientRows.length === 0) {
      return res.status(404).json({ error: "Phone number not found" });
    }

    const patient = patientRows[0];

    const [visitRows]: any = await connection.execute(
      `SELECT visit_id
       FROM visit
       WHERE patient_id = ? AND visit_date = CURDATE()
       ORDER BY created_at DESC
       LIMIT 1`,
      [patient.patient_id]
    );

    if (visitRows.length === 0) {
      return res.status(404).json({ error: "No visit found for today" });
    }

    const visitId = visitRows[0].visit_id;

    const [queueRows]: any = await connection.execute(
      `SELECT queue_id
       FROM queue
       WHERE visit_id = ?`,
      [visitId]
    );

    if (queueRows.length === 0) {
      return res.status(404).json({ error: "Queue not found" });
    }

    const queueData = await buildQueueData(queueRows[0].queue_id);
    return res.json(queueData);
  } finally {
    connection.release();
  }
};

/**
 * Get all queues for a specific department
 */
export async function getDepartmentQueues(departmentId: number) {
  const connection = await pool.getConnection();
  try {
    const [queues]: any = await connection.execute(
      `SELECT 
        q.queue_id, 
        q.queue_number, 
        q.status, 
        q.issued_time, 
        q.skipped_time,
        q.is_skipped, 
        q.priority_score,
        v.vn, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.phone_number
       FROM queue q
       JOIN visit v ON q.visit_id = v.visit_id
       JOIN patient p ON v.patient_id = p.patient_id
       WHERE q.department_id = ? AND DATE(q.issued_time) = CURDATE()
       ORDER BY q.priority_score DESC, q.issued_time ASC`,
      [departmentId]
    );

    return queues.map((q: any) => ({
      queueId: q.queue_id,
      queueNumber: q.queue_number,
      patientName: q.patient_name,
      phoneNumber: q.phone_number || 'ไม่มีข้อมูล',
      vn: q.vn,
      status: q.status,
      issuedTime: new Date(q.issued_time).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isSkipped: Boolean(q.is_skipped),
      priorityScore: q.priority_score,
      skippedTime: q.skipped_time || null,
    }));
  } finally {
    connection.release();
  }
}