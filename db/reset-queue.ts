import { RowDataPacket } from "mysql2";
import "dotenv/config";
import { pool } from "../src/config/database.js";

async function resetQueue() {
  const connection = await pool.getConnection();

  try {
    console.log("🔄 Resetting Queues only...");

    // ==================== CLEAR QUEUE DATA ====================
    console.log("🗑️  Clearing queue tables...");
    // ต้องลบ history ก่อนเพราะติด FK
    await connection.execute("TRUNCATE TABLE queue_status_history");
    // ลบ queue (ถ้าติด FK กับตารางอื่นที่ไม่ใช่ history อาจต้องปิด check ก่อน)
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE queue");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("✅ Queue data cleared");

    // ==================== RE-INSERT QUEUES ====================
    console.log("🎫 Re-creating initial queues...");

    // อายุรกรรม (MED)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('MED001', 1, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 60 MINUTE), 0, 0),
      ('MED002', 2, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 55 MINUTE), 0, 0),
      ('MED003', 8, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 50 MINUTE), 0, 0),
      ('MED004', 21, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 45 MINUTE), 0, 0),
      ('MED005', 22, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 40 MINUTE), 0, 0),
      ('MED006', 23, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 35 MINUTE), 0, 0),
      ('MED007', 24, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 0, 0),
      ('MED008', 25, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 25 MINUTE), 0, 0),
      ('MED009', 26, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 0, 0),
      ('MED010', 27, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 15 MINUTE), 0, 0),
      ('MED011', 28, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0),
      ('MED012', 29, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0, 0),
      ('MED013', 30, 1, UUID(), 'waiting', NOW(), 0, 0)
    `);

    // ศัลยกรรม (SUR)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('SUR001', 3, 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 35 MINUTE), 50, 1),
      ('SUR002', 9, 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 15 MINUTE), 0, 0)
    `);

    // กุมารเวชกรรม (PED)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('PED001', 5, 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // สูติ-นรีเวชกรรม (OBG)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('OBG001', 4, 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 40 MINUTE), 0, 0),
      ('OBG002', 10, 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 12 MINUTE), 0, 0)
    `);

    // ทันตกรรม (DEN)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('DEN001', 6, 5, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 8 MINUTE), 0, 0)
    `);

    // ตรวจสุขภาพ (CHK)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('CHK001', 7, 6, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0, 0)
    `);

    console.log("✅ Queues re-created");

    // ==================== RESET HISTORY ====================
    console.log("📊 Resetting history logs...");
    await connection.execute(`
      INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at)
      SELECT queue_id, NULL, 'waiting', 'system', issued_time
      FROM queue
    `);

    // Summary
    const [queueCount] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM queue"
    );
    console.log(
      `\n🎉 Queue Reset Completed! Total Queues: ${queueCount[0].count}`
    );
    console.log("พร้อมสำหรับการทดสอบรันคิวใหม่แล้วครับ");
  } catch (error) {
    console.error("❌ Reset Queue failed:", error);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

resetQueue();
