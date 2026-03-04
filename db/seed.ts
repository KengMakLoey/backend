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
      INSERT INTO department (department_name, department_code, building, floor, room, room_image, directions) VALUES
      ('คลินิกศัลยกรรมทางเดินปัสสาวะ', 'URO', '3', '1', NULL, 'rooms/uro.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 1 เลี้ยวซ้าย เดินตรง 10 เมตร'),
      ('คลินิกกุมาร', 'PED', '3', '2', NULL, 'rooms/ped.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 2 เลี้ยวขวา'),
      ('คลินิกสูติ-นรีเวช', 'OBG', '3', '2', 'G210', 'rooms/obg.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 2 ห้อง G210'),
      ('คลินิกโรคเรื้อรัง', 'NCD', '3', '3', 'M370', 'rooms/ncd.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 3 ห้อง M370'),
      ('คลินิกพิเศษอายุรกรรม', 'SPM', '3', '3', 'M360', 'rooms/spm.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 3 ห้อง M360'),
      ('ไตเทียม', 'DIA', '3', '3', NULL, 'rooms/dia.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 3 เลี้ยวซ้าย'),
      ('คลินิกอายุรกรรม', 'MED', '3', '3', 'M380', 'rooms/med.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 3 ห้อง M380'),
      ('คลินิกตา', 'EYE', '3', '4', 'E400', 'rooms/eye.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 4 ห้อง E400'),
      ('คลินิกทันตกรรม', 'DEN', '3', '4', NULL, 'rooms/den.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 4 เลี้ยวขวา'),
      ('คลินิกหู คอ จมูก', 'ENT', '3', '4', 'N450', 'rooms/ent.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 4 ห้อง N450'),
      ('ห้องตรวจสุขภาพพิเศษ', 'SPC', '3', '4', NULL, 'rooms/spc.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 4 เลี้ยวซ้าย');
    `);
    console.log("✅ Departments created");

    // ==================== STAFF ====================
    console.log("👥 Creating staff accounts...");
    await connection.execute(`
    INSERT INTO staff (staff_name, username, password, role, department_id) VALUES
    ('คลินิกศัลยกรรมทางเดินปัสสาวะ', 'uro', 'uro123', 'doctor', 1),
    ('คลินิกกุมาร', 'ped', 'ped123', 'doctor', 2),
    ('คลินิกสูติ-นรีเวช', 'obg', 'obg123', 'doctor', 3),
    ('คลินิกโรคเรื้อรัง', 'ncd', 'ncd123', 'doctor', 4),
    ('คลินิกพิเศษอายุรกรรม', 'spm', 'spm123', 'doctor', 5),
    ('ไตเทียม', 'dia', 'dia123', 'doctor', 6),
    ('คลินิกอายุรกรรม', 'med', 'med123', 'doctor', 7),
    ('คลินิกตา', 'eye', 'eye123', 'doctor', 8),
    ('คลินิกทันตกรรม', 'den', 'den123', 'doctor', 9),
    ('คลินิกหู คอ จมูก', 'ent', 'ent123', 'doctor', 10),
    ('ห้องตรวจสุขภาพพิเศษ', 'spc', 'spc123', 'doctor', 11)
  `);
    console.log("✅ Staff accounts created");

    // ==================== PATIENTS (HN 7 หลัก) ====================
    console.log("🏥 Creating patients...");
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
      ('HN0000020', 'ทดสอบ', 'สร้างคิว10', '0800000000')
    `);
    console.log("✅ Patients created");

    // ==================== VISITS (VN260108-XXXX) ====================
    console.log("📅 Creating visits...");
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2); // 26
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // 01
    const dd = String(today.getDate()).padStart(2, "0"); // 08
    const dateStr = today.toISOString().split("T")[0];

    // VN format: VN260108-0001
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
      ('VN${yy}${mm}${dd}-0020', 20, '${dateStr}', 'OPD')
    `);
    console.log("✅ Visits created");

    // ==================== QUEUES ====================
    console.log("🎫 Creating queues...");

    // อายุรกรรม - 3 คิว
    
    // แก้ไข department_id ให้ตรงกับ queue prefix:
    // MED (อายุรกรรม) → department_id 7
    // URO (ศัลยกรรมทางเดินปัสสาวะ) → department_id 1
    // PED (กุมาร) → department_id 2
    // OBG (สูติ-นรีเวช) → department_id 3
    // NCD (โรคเรื้อรัง) → department_id 4
    // DIA (ไตเทียม) → department_id 6
    // DEN (ทันตกรรม) → department_id 9
    // SPC (ตรวจสุขภาพพิเศษ) → department_id 11

    // 1. อายุรกรรม (MED) - department_id 7
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('MED001', 1, 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 0, 0),
      ('MED002', 2, 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 25 MINUTE), 0, 0),
      ('MED003', 8, 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 0, 0)
    `);

    // 2. ศัลยกรรมทางเดินปัสสาวะ (URO) - department_id 1 (2 คิว, 1 ข้าม)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('URO001', 3, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 35 MINUTE), 50, 1),
      ('URO002', 9, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 15 MINUTE), 0, 0)
    `);

    // 3. กุมาร (PED) - department_id 2
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('PED001', 5, 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // 4. สูติ-นรีเวช (OBG) - department_id 3
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('OBG001', 4, 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 40 MINUTE), 0, 0),
      ('OBG002', 10, 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 12 MINUTE), 0, 0)
    `);

    // 5. โรคเรื้อรัง (NCD) - department_id 4
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('NCD001', 6, 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 8 MINUTE), 0, 0)
    `);

    // 6. ไตเทียม (DIA) - department_id 6
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('DIA001', 7, 6, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0, 0)
    `);

    // 7. ทันตกรรม (DEN) - department_id 9
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('DEN001', 11, 9, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 3 MINUTE), 0, 0)
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
    const [deptCount]: any = await connection.execute(
      "SELECT COUNT(*) as count FROM department",
    );
    const [staffCount]: any = await connection.execute(
      "SELECT COUNT(*) as count FROM staff",
    );
    const [patientCount]: any = await connection.execute(
      "SELECT COUNT(*) as count FROM patient",
    );
    const [visitCount]: any = await connection.execute(
      "SELECT COUNT(*) as count FROM visit",
    );
    const [queueCount]: any = await connection.execute(
      "SELECT COUNT(*) as count FROM queue",
    );

    console.log("\n✅ Seed completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Departments: ${deptCount[0].count}`);
    console.log(`   - Staff: ${staffCount[0].count}`);
    console.log(`   - Patients: ${patientCount[0].count}`);
    console.log(`   - Visits: ${visitCount[0].count}`);
    console.log(`   - Queues: ${queueCount[0].count}`);
    
    console.log("\n🎫 Queue Mapping (ถูกต้องแล้ว):");
    console.log("   - MED001-MED003 → คลินิกอายุรกรรม (department_id: 7)");
    console.log("   - URO001-URO002 → คลินิกศัลยกรรมทางเดินปัสสาวะ (department_id: 1)");
    console.log("   - PED001 → คลินิกกุมาร (department_id: 2)");
    console.log("   - OBG001-OBG002 → คลินิกสูติ-นรีเวช (department_id: 3)");
    console.log("   - NCD001 → คลินิกโรคเรื้อรัง (department_id: 4)");
    console.log("   - DIA001 → ไตเทียม (department_id: 6)");
    console.log("   - DEN001 → คลินิกทันตกรรม (department_id: 9)");
    
    console.log("\n🔑 Test Accounts:");
    console.log("   Staff Login:");
    console.log("   - Username: uro / Password: uro123 (คลินิกศัลยกรรมทางเดินปัสสาวะ)");
    console.log("   - Username: ped / Password: ped123 (คลินิกกุมาร)");
    console.log("   - Username: obg / Password: obg123 (คลินิกสูติ-นรีเวช)");
    console.log("   - Username: ncd / Password: ncd123 (คลินิกโรคเรื้อรัง)");
    console.log("   - Username: spm / Password: spm123 (คลินิกพิเศษอายุรกรรม)");
    console.log("   - Username: dia / Password: dia123 (ไตเทียม)");
    console.log("   - Username: med / Password: med123 (คลินิกอายุรกรรม)");
    console.log("   - Username: eye / Password: eye123 (คลินิกตา)");
    console.log("   - Username: den / Password: den123 (คลินิกทันตกรรม)");
    console.log("   - Username: ent / Password: ent123 (คลินิกหู คอ จมูก)");
    console.log("   - Username: spc / Password: spc123 (ห้องตรวจสุขภาพพิเศษ)");

    console.log(`\n📋 Test VN Numbers (Format: VN${yy}${mm}${dd}-XXXX):`);
    console.log(`\n   ✅ VN ที่มีคิวแล้ว:`);
    console.log(`   - VN${yy}${mm}${dd}-0001 (HN0000001 - สมชาย ใจดี - อายุรกรรม/MED001)`);
    console.log(`   - VN${yy}${mm}${dd}-0002 (HN0000002 - สมหญิง รักษ์ดี - อายุรกรรม/MED002)`);
    console.log(`   - VN${yy}${mm}${dd}-0003 (HN0000003 - วิชัย สุขสันต์ - ศัลยกรรมทางเดินปัสสาวะ/URO001 - ข้ามคิว)`);
    console.log(`   - VN${yy}${mm}${dd}-0004 (HN0000004 - วิภา แสนดี - สูติ-นรีเวช/OBG001)`);
    console.log(`   - VN${yy}${mm}${dd}-0005 (HN0000005 - สมศักดิ์ เจริญ - กุมาร/PED001)`);
    console.log(`   - VN${yy}${mm}${dd}-0006 (HN0000006 - อรุณี มีสุข - โรคเรื้อรัง/NCD001)`);
    console.log(`   - VN${yy}${mm}${dd}-0007 (HN0000007 - ประเสริฐ ดีงาม - ไตเทียม/DIA001)`);
    console.log(`   - VN${yy}${mm}${dd}-0011 (HN0000011 - ทดสอบ สร้างคิว1 - ทันตกรรม/DEN001)`);
    
    console.log(`\n   🆕 VN สำหรับทดสอบสร้างคิว (ไม่มีคิว):`);
    console.log(`   - VN${yy}${mm}${dd}-0012 ถึง VN${yy}${mm}${dd}-0020`);
    console.log(`\n   💡 Tips: สามารถกรอกแค่ตัวเลข เช่น "12", "13" หรือ "VN12", "VN13"`);
    
    console.log(`\n📋 Test VN Numbers (Format: VN${yy}${mm}${dd}-XXXX):`);
    console.log(`\n   ✅ VN ที่มีคิวแล้ว (1-10):`);
    console.log(
      `   - VN${yy}${mm}${dd}-0001 (HN0000001 - สมชาย ใจดี - อายุรกรรม)`,
    );
    console.log(
      `   - VN${yy}${mm}${dd}-0002 (HN0000002 - สมหญิง รักษ์ดี - อายุรกรรม)`,
    );
    console.log(
      `   - VN${yy}${mm}${dd}-0003 (HN0000003 - วิชัย สุขสันต์ - ศัลยกรรม - ข้ามคิว)`,
    );
    console.log(`\n   🆕 VN สำหรับทดสอบสร้างคิว (11-20):`);
    console.log(`   - VN${yy}${mm}${dd}-0011 (HN0000011 - ทดสอบ สร้างคิว1)`);
    console.log(`   - VN${yy}${mm}${dd}-0012 (HN0000012 - ทดสอบ สร้างคิว2)`);
    console.log(`   - VN${yy}${mm}${dd}-0013 (HN0000013 - ทดสอบ สร้างคิว3)`);
    console.log(`   ... ถึง VN${yy}${mm}${dd}-0020`);
    console.log(
      `\n   💡 Tips: สามารถกรอกแค่ตัวเลข เช่น "11", "12" หรือ "VN11", "VN12"`,
    );
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
