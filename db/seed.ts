// เพิ่ม RowDataPacket เข้าไปใน import
import { RowDataPacket } from "mysql2";
import "dotenv/config";
import { pool } from "../src/config/database.js";

/**
 * Database Seed Script
 * รูปแบบ HN: HN0000001 (7 หลัก)
 * รูปแบบ VN: VN260108-0001 (VNYYDDMM-XXXX)
 */

async function seed() {
  const connection = await pool.getConnection();

  try {
    console.log("🌱 Starting database seed...");

    // ==================== CLEAR EXISTING DATA ====================
    console.log("🗑️  Clearing existing data...");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE notification");
    await connection.execute("TRUNCATE TABLE queue_status_history");
    await connection.execute("TRUNCATE TABLE queue");
    await connection.execute("TRUNCATE TABLE visit");
    await connection.execute("TRUNCATE TABLE patient");
    await connection.execute("TRUNCATE TABLE staff");
    await connection.execute("TRUNCATE TABLE department");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("✅ Data cleared");

    // ==================== DEPARTMENTS ====================
    console.log("📋 Creating departments...");
    await connection.execute(`
      INSERT INTO department (department_name, department_code, building, floor, room) VALUES
      ('อายุรกรรม', 'MED', 'อาคารผู้ป่วยนอก', 'ชั้น 2', 'ห้อง 201-205'),
      ('ศัลยกรรม', 'SUR', 'อาคารผู้ป่วยนอก', 'ชั้น 2', 'ห้อง 206-210'),
      ('กุมารเวชกรรม', 'PED', 'อาคารผู้ป่วยนอก', 'ชั้น 3', 'ห้อง 301-305'),
      ('สูติ-นรีเวชกรรม', 'OBG', 'อาคารผู้ป่วยนอก', 'ชั้น 3', 'ห้อง 306-310'),
      ('ทันตกรรม', 'DEN', 'อาคารทันตกรรม', 'ชั้น 1', 'ห้อง 101-103'),
      ('ตรวจสุขภาพ', 'CHK', 'อาคารผู้ป่วยนอก', 'ชั้น 1', 'ห้อง 105-108')
    `);
    console.log("✅ Departments created");

    // ==================== STAFF ====================
    console.log("👥 Creating staff accounts...");
    await connection.execute(`
      INSERT INTO staff (staff_name, username, password, role, department_id) VALUES
      ('พญ.สมหญิง ใจดี', 'staff', 'staff123', 'doctor', 1),
      ('พญ.วิภา ศรีสุข', 'doctor1', 'doctor123', 'doctor', 1),
      ('นพ.สมชาย รักษา', 'doctor2', 'doctor123', 'doctor', 2),
      ('พญ.อรุณี เด็กดี', 'doctor3', 'doctor123', 'doctor', 3),
      ('พญ.ชนิดา สุขใจ', 'doctor4', 'doctor123', 'doctor', 4),
      ('ทพ.ประเสริฐ ฟันขาว', 'dentist1', 'dentist123', 'dentist', 5),
      ('พยาบาล กานดา ดูแล', 'nurse1', 'nurse123', 'nurse', 1),
      ('พยาบาล สมศรี เอาใจใส่', 'nurse2', 'nurse123', 'nurse', 2),
      ('เจ้าหน้าที่ สมพร บริการ', 'staff1', 'staff123', 'staff', 6)
    `);
    console.log("✅ Staff accounts created");

    // ==================== PATIENTS ====================
    console.log("🏥 Creating patients...");
    // เพิ่ม HN21-HN30 เพื่อใช้สำหรับถมคิวให้เยอะๆ
    await connection.execute(`
      INSERT INTO patient (hn, first_name, last_name, phone_number) VALUES
      ('HN0000001', 'สมชาย', 'ใจดี', '0812345678'),
      ('HN0000002', 'สมหญิง', 'รักษ์ดี', '0823456789'),
      ('HN0000003', 'วิชัย', 'สุขสันต์', '0834567890'),
      ('HN0000004', 'วิภา', 'แสนดี', '0845678901'),
      ('HN0000005', 'สมศักดิ์', 'เจริญ', '0856789012'),
      ('HN0000006', 'อรุณี', 'มีสุข', '0867890123'),
      ('HN0000007', 'ประเสริฐ', 'ดีงาม', '0878901234'),
      ('HN0000008', 'กานดา', 'สวยงาม', '0889012345'),
      ('HN0000009', 'สมพร', 'ร่มเย็น', '0890123456'),
      ('HN0000010', 'ชนิดา', 'แจ่มใส', '0801234567'),
      ('HN0000011', 'ทดสอบ', 'สร้างคิว1', '0811111111'),
      ('HN0000012', 'ทดสอบ', 'สร้างคิว2', '0822222222'),
      ('HN0000013', 'ทดสอบ', 'สร้างคิว3', '0833333333'),
      ('HN0000014', 'ทดสอบ', 'สร้างคิว4', '0844444444'),
      ('HN0000015', 'ทดสอบ', 'สร้างคิว5', '0855555555'),
      ('HN0000016', 'ทดสอบ', 'สร้างคิว6', '0866666666'),
      ('HN0000017', 'ทดสอบ', 'สร้างคิว7', '0877777777'),
      ('HN0000018', 'ทดสอบ', 'สร้างคิว8', '0888888888'),
      ('HN0000019', 'ทดสอบ', 'สร้างคิว9', '0899999999'),
      ('HN0000020', 'ทดสอบ', 'สร้างคิว10', '0800000000'),
      ('HN0000021', 'คนไข้', 'เยอะ1', '0800000021'),
      ('HN0000022', 'คนไข้', 'เยอะ2', '0800000022'),
      ('HN0000023', 'คนไข้', 'เยอะ3', '0800000023'),
      ('HN0000024', 'คนไข้', 'เยอะ4', '0800000024'),
      ('HN0000025', 'คนไข้', 'เยอะ5', '0800000025'),
      ('HN0000026', 'คนไข้', 'เยอะ6', '0800000026'),
      ('HN0000027', 'คนไข้', 'เยอะ7', '0800000027'),
      ('HN0000028', 'คนไข้', 'เยอะ8', '0800000028'),
      ('HN0000029', 'คนไข้', 'เยอะ9', '0800000029'),
      ('HN0000030', 'คนไข้', 'เยอะ10', '0800000030')
    `);
    console.log("✅ Patients created");

    // ==================== VISITS ====================
    console.log("📅 Creating visits...");
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = today.toISOString().split("T")[0];

    // เพิ่ม VN21-30
    await connection.execute(`
      INSERT INTO visit (vn, patient_id, visit_date, visit_type) VALUES
      ('VN${yy}${mm}${dd}-0001', 1, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0002', 2, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0003', 3, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0004', 4, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0005', 5, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0006', 6, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0007', 7, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0008', 8, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0009', 9, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0010', 10, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0011', 11, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0012', 12, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0013', 13, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0014', 14, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0015', 15, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0016', 16, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0017', 17, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0018', 18, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0019', 19, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0020', 20, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0021', 21, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0022', 22, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0023', 23, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0024', 24, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0025', 25, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0026', 26, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0027', 27, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0028', 28, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0029', 29, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0030', 30, '${dateStr}', 'OPD')
    `);
    console.log("✅ Visits created");

    // ==================== QUEUES ====================
    console.log("🎫 Creating queues...");

    // อายุรกรรม (MED) - เดิม 3 คิว + เพิ่ม 10 คิว (VN 21-30) = รวม 13 คิว
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

    // ศัลยกรรม - 2 คิว (1 ข้าม)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('SUR001', 3, 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 35 MINUTE), 50, 1),
      ('SUR002', 9, 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 15 MINUTE), 0, 0)
    `);

    // กุมารเวชกรรม - 1 คิว
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('PED001', 5, 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // สูติ-นรีเวชกรรม - 2 คิว
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('OBG001', 4, 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 40 MINUTE), 0, 0),
      ('OBG002', 10, 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 12 MINUTE), 0, 0)
    `);

    // ทันตกรรม - 1 คิว
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('DEN001', 6, 5, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 8 MINUTE), 0, 0)
    `);

    // ตรวจสุขภาพ - 1 คิว
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('CHK001', 7, 6, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0, 0)
    `);

    console.log("✅ Queues created");

    // ==================== QUEUE STATUS HISTORY ====================
    console.log("📊 Creating queue status history...");
    await connection.execute(`
      INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at)
      SELECT queue_id, NULL, 'waiting', 'system', issued_time
      FROM queue
    `);
    console.log("✅ Queue status history created");

    // ==================== SUMMARY ====================
    // ใช้ <RowDataPacket[]> เพื่อบอก TypeScript ว่าผลลัพธ์คือ Array
    const [deptCount] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM department"
    );
    const [staffCount] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM staff"
    );
    const [patientCount] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM patient"
    );
    const [visitCount] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM visit"
    );
    const [queueCount] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM queue"
    );

    console.log("\n✅ Seed completed successfully!\n");
    console.log("📊 Summary:");
    // ตอนนี้ TypeScript จะยอมให้ใช้ [0] แล้ว
    console.log(`   - Departments: ${deptCount[0].count}`);
    console.log(`   - Staff: ${staffCount[0].count}`);
    console.log(`   - Patients: ${patientCount[0].count}`);
    console.log(`   - Visits: ${visitCount[0].count}`);
    console.log(`   - Queues: ${queueCount[0].count}`);
    console.log("\n🔑 Test Accounts:");
    console.log("   Staff Login:");
    console.log(
      "   - Username: staff / Password: staff123 (อายุรกรรม - คนเยอะ 13 คิว)"
    );
    console.log("   - Username: doctor2 / Password: doctor123 (ศัลยกรรม)");
    console.log(`\n📋 Test VN Numbers:`);
    console.log(`   🔥 อายุรกรรม (MED): คิวแน่น (VN 1,2,8 และ 21-30)`);
    console.log(`   🆕 VN ว่างสำหรับทดสอบ (11-20)`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run seed
seed()
  .then(() => {
    console.log("\n🎉 Seed script finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed script failed:", error);
    process.exit(1);
  });
