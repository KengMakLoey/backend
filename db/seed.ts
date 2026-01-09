import "dotenv/config";
import { pool } from "../src/config/database.js";

/**
 * Database Seed Script
 * ใช้สำหรับสร้างข้อมูลทดสอบในระบบ
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
    // แต่ละแผนกมี department_code ที่ไม่ซ้ำกัน
    // department_code จะเป็นตัวกำหนดคิว เช่น MED001, SUR001
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
    await connection.execute(`
      INSERT INTO patient (hn, first_name, last_name, phone_number) VALUES
      ('HN0001', 'สมชาย', 'ใจดี', '0812345678'),
      ('HN0002', 'สมหญิง', 'รักษ์ดี', '0823456789'),
      ('HN0003', 'วิชัย', 'สุขสันต์', '0834567890'),
      ('HN0004', 'วิภา', 'แสนดี', '0845678901'),
      ('HN0005', 'สมศักดิ์', 'เจริญ', '0856789012'),
      ('HN0006', 'อรุณี', 'มีสุข', '0867890123'),
      ('HN0007', 'ประเสริฐ', 'ดีงาม', '0878901234'),
      ('HN0008', 'กานดา', 'สวยงาม', '0889012345'),
      ('HN0009', 'สมพร', 'ร่มเย็น', '0890123456'),
      ('HN0010', 'ชนิดา', 'แจ่มใส', '0801234567')
    `);
    console.log("✅ Patients created");

    // ==================== VISITS ====================
    console.log("📅 Creating visits...");
    const today = new Date().toISOString().split('T')[0];
    await connection.execute(`
      INSERT INTO visit (vn, patient_id, visit_date, visit_type) VALUES
      ('VN202601080001', 1, '${today}', 'OPD'),
      ('VN202601080002', 2, '${today}', 'OPD'),
      ('VN202601080003', 3, '${today}', 'OPD'),
      ('VN202601080004', 4, '${today}', 'OPD'),
      ('VN202601080005', 5, '${today}', 'OPD'),
      ('VN202601080006', 6, '${today}', 'OPD'),
      ('VN202601080007', 7, '${today}', 'OPD'),
      ('VN202601080008', 8, '${today}', 'OPD'),
      ('VN202601080009', 9, '${today}', 'OPD'),
      ('VN202601080010', 10, '${today}', 'OPD')
    `);
    console.log("✅ Visits created");

    // ==================== QUEUES ====================
    console.log("🎫 Creating queues...");
    const now = new Date();
    
    // อายุรกรรม - 3 คิว
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('MED001', 1, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 0, 0),
      ('MED002', 2, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 25 MINUTE), 0, 0),
      ('MED003', 8, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 0, 0)
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
    const [deptCount]: any = await connection.execute("SELECT COUNT(*) as count FROM department");
    const [staffCount]: any = await connection.execute("SELECT COUNT(*) as count FROM staff");
    const [patientCount]: any = await connection.execute("SELECT COUNT(*) as count FROM patient");
    const [visitCount]: any = await connection.execute("SELECT COUNT(*) as count FROM visit");
    const [queueCount]: any = await connection.execute("SELECT COUNT(*) as count FROM queue");

    console.log("\n✅ Seed completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Departments: ${deptCount[0].count}`);
    console.log(`   - Staff: ${staffCount[0].count}`);
    console.log(`   - Patients: ${patientCount[0].count}`);
    console.log(`   - Visits: ${visitCount[0].count}`);
    console.log(`   - Queues: ${queueCount[0].count}`);
    console.log("\n🔑 Test Accounts:");
    console.log("   Staff Login:");
    console.log("   - Username: staff / Password: staff123 (อายุรกรรม)");
    console.log("   - Username: doctor2 / Password: doctor123 (ศัลยกรรม)");
    console.log("\n   Test VN Numbers:");
    console.log("   - VN202601080001 (อายุรกรรม - สมชาย)");
    console.log("   - VN202601080002 (อายุรกรรม - สมหญิง)");
    console.log("   - VN202601080003 (ศัลยกรรม - วิชัย - ข้ามคิว)");
    
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