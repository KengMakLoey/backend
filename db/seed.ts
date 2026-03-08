import "dotenv/config";
import { pool } from "../src/config/database.js";
import bcrypt from "bcrypt";

/**
 * Database Seed Script
 * รูปแบบ HN: HN0000001 (7 หลัก)
 * รูปแบบ VN: VN260108-0001 (VNYYDDMM-XXXX)
 *
 * สรุปข้อมูล:
 *   HN0000001–0064  : มีชื่อจริง มีคิวทั้งหมด
 *   HN0000065–0120  : ทดสอบ คนที่1–56 ยังไม่มีคิว ไว้สร้างเอง
 */

async function seed() {
  const connection = await pool.getConnection();

  try {
    console.log("🌱 Starting database seed...");

    // ==================== CLEAR ====================
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
      ('คลินิกศัลยกรรมทางเดินปัสสาวะ', 'URO', '3', '1', NULL,   'rooms/uro.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 1 เลี้ยวซ้าย เดินตรง 10 เมตร'),
      ('คลินิกกุมาร',                  'PED', '3', '2', NULL,   'rooms/ped.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 2 เลี้ยวขวา'),
      ('คลินิกสูติ-นรีเวช',            'OBG', '3', '2', 'G210', 'rooms/obg.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 2 ห้อง G210'),
      ('คลินิกโรคเรื้อรัง',            'NCD', '3', '3', 'M370', 'rooms/ncd.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 3 ห้อง M370'),
      ('คลินิกพิเศษอายุรกรรม',         'SPM', '3', '3', 'M360', 'rooms/spm.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 3 ห้อง M360'),
      ('ไตเทียม',                      'DIA', '3', '3', NULL,   'rooms/dia.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 3 เลี้ยวซ้าย'),
      ('คลินิกอายุรกรรม',              'MED', '3', '3', 'M380', 'rooms/med.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 3 ห้อง M380'),
      ('คลินิกตา',                     'EYE', '3', '4', 'E400', 'rooms/eye.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 4 ห้อง E400'),
      ('คลินิกทันตกรรม',               'DEN', '3', '4', NULL,   'rooms/den.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 4 เลี้ยวขวา'),
      ('คลินิกหู คอ จมูก',             'ENT', '3', '4', 'N450', 'rooms/ent.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 4 ห้อง N450'),
      ('ห้องตรวจสุขภาพพิเศษ',          'SPC', '3', '4', NULL,   'rooms/spc.jpg', 'ขึ้นลิฟต์ตึก 3 ชั้น 4 เลี้ยวซ้าย')
    `);
    console.log("✅ Departments created");

    // ==================== STAFF ====================
    console.log("👥 Creating staff accounts...");
    const staffList = ["uro","ped","obg","ncd","spm","dia","med","eye","den","ent","spc"];
    const staffNames: Record<string, string> = {
      uro: "คลินิกศัลยกรรมทางเดินปัสสาวะ",
      ped: "คลินิกกุมาร",
      obg: "คลินิกสูติ-นรีเวช",
      ncd: "คลินิกโรคเรื้อรัง",
      spm: "คลินิกพิเศษอายุรกรรม",
      dia: "ไตเทียม",
      med: "คลินิกอายุรกรรม",
      eye: "คลินิกตา",
      den: "คลินิกทันตกรรม",
      ent: "คลินิกหู คอ จมูก",
      spc: "ห้องตรวจสุขภาพพิเศษ",
    };

    for (let i = 0; i < staffList.length; i++) {
      const code = staffList[i];
      const hash = await bcrypt.hash(`${code}123`, 10);
      await connection.execute(
        `INSERT INTO staff (staff_name, username, password, role, department_id) VALUES (?, ?, ?, 'doctor', ?)`,
        [staffNames[code], code, hash, i + 1]
      );
    }
    console.log("✅ Staff accounts created");

    // ==================== PATIENTS ====================
    console.log("🏥 Creating patients...");

    // HN0000001–0010 : ผู้ป่วยจริง
    await connection.execute(`
      INSERT INTO patient (hn, first_name, last_name, phone_number) VALUES
      ('HN0000001', 'สมชาย',    'ใจดี',       '0909430734'),
      ('HN0000002', 'สมหญิง',   'รักษ์ดี',    '0909390562'),
      ('HN0000003', 'วิชัย',    'สุขสันต์',   '0834567890'),
      ('HN0000004', 'วิภา',     'แสนดี',      '0845678901'),
      ('HN0000005', 'สมศักดิ์', 'เจริญ',      '0856789012'),
      ('HN0000006', 'อรุณี',    'มีสุข',      '0867890123'),
      ('HN0000007', 'ประเสริฐ', 'ดีงาม',      '0878901234'),
      ('HN0000008', 'กานดา',    'สวยงาม',     '0889012345'),
      ('HN0000009', 'สมพร',     'ร่มเย็น',    '0890123456'),
      ('HN0000010', 'ชนิดา',    'แจ่มใส',     '0801234567')
    `);

    // HN0000011–0020 : มีคิวตัวอย่าง (มีชื่อจริง)
    await connection.execute(`
      INSERT INTO patient (hn, first_name, last_name, phone_number) VALUES
      ('HN0000011', 'สุภาพร',   'มีสุข',       '0811111111'),
      ('HN0000012', 'ณัฐพงษ์',  'จันทร์แก้ว',  '0822222222'),
      ('HN0000013', 'อมรรัตน์', 'ทองเจริญ',    '0833333333'),
      ('HN0000014', 'ปราโมทย์', 'สีดา',         '0844444444'),
      ('HN0000015', 'นิตยา',    'พรหมบุตร',    '0855555555'),
      ('HN0000016', 'ธนาวุฒิ',  'ขุนทด',        '0866666666'),
      ('HN0000017', 'พรพิมล',   'วิชัยดิษฐ์',   '0877777777'),
      ('HN0000018', 'สมพงษ์',   'ใจบุญ',        '0888888888'),
      ('HN0000019', 'จันทิมา',  'แสงทอง',       '0899999999'),
      ('HN0000020', 'วิรัตน์',  'คำเงิน',       '0800000000')
    `);

    // HN0000021–0064 : มีคิวตัวอย่างครบแผนก (มีชื่อจริง)
    await connection.execute(`
      INSERT INTO patient (hn, first_name, last_name, phone_number) VALUES
      ('HN0000021', 'นภาพร',      'สุขใจ',        '0821000021'),
      ('HN0000022', 'ธนกร',       'พรมมา',        '0821000022'),
      ('HN0000023', 'พิมพ์ชนก',   'วงศ์สวัสดิ์',  '0821000023'),
      ('HN0000024', 'อานนท์',     'ทองดี',        '0821000024'),
      ('HN0000025', 'ปิยะนุช',    'แก้วมณี',      '0821000025'),
      ('HN0000026', 'ศุภชัย',     'ลือชา',        '0821000026'),
      ('HN0000027', 'วรรณา',      'ศรีสุข',       '0821000027'),
      ('HN0000028', 'ธีรพงษ์',    'บุญมาก',       '0821000028'),
      ('HN0000029', 'กนกวรรณ',    'หมื่นชนะ',     '0821000029'),
      ('HN0000030', 'วีระชัย',    'ดวงแก้ว',      '0821000030'),
      ('HN0000031', 'สุนีย์',     'คำภา',         '0821000031'),
      ('HN0000032', 'ณัฐวุฒิ',    'ใจกล้า',       '0821000032'),
      ('HN0000033', 'ภัทรา',      'สิงห์ทอง',     '0821000033'),
      ('HN0000034', 'ชัยวัฒน์',   'รักษาศิล',     '0821000034'),
      ('HN0000035', 'มณีรัตน์',   'พันธุ์ดี',      '0821000035'),
      ('HN0000036', 'สมบูรณ์',    'แสนสุข',       '0821000036'),
      ('HN0000037', 'นิภาพร',     'ขาวสะอาด',     '0821000037'),
      ('HN0000038', 'ประวิทย์',   'ศิริมงคล',     '0821000038'),
      ('HN0000039', 'ลลิตา',      'เพ็งจันทร์',   '0821000039'),
      ('HN0000040', 'ไพโรจน์',    'บัวงาม',       '0821000040'),
      ('HN0000041', 'สายชล',      'ทองสุข',       '0821000041'),
      ('HN0000042', 'วิทยา',      'มีแก้ว',       '0821000042'),
      ('HN0000043', 'ดารณี',      'สมบัติ',       '0821000043'),
      ('HN0000044', 'ยุทธนา',     'แก้วใส',       '0821000044'),
      ('HN0000045', 'กาญจนา',     'ชูศรี',        '0821000045'),
      ('HN0000046', 'อภิชาต',     'ศรีงาม',       '0821000046'),
      ('HN0000047', 'รัตนา',      'เจริญผล',      '0821000047'),
      ('HN0000048', 'สิทธิชัย',   'วรรณศรี',      '0821000048'),
      ('HN0000049', 'พรทิพย์',    'นาคเงิน',      '0821000049'),
      ('HN0000050', 'ณรงค์',      'ภูมิดี',       '0821000050'),
      ('HN0000051', 'จิราพร',     'สายบัว',       '0821000051'),
      ('HN0000052', 'ธนพล',       'อินทร์ดี',     '0821000052'),
      ('HN0000053', 'เพ็ญพักตร์', 'คงมั่น',       '0821000053'),
      ('HN0000054', 'สุรชัย',     'ลาภมูล',       '0821000054'),
      ('HN0000055', 'วิไลวรรณ',   'ศรีทอง',       '0821000055'),
      ('HN0000056', 'พงษ์พันธ์',  'บุญเกื้อ',      '0821000056'),
      ('HN0000057', 'นุชนาถ',     'พรมพิทักษ์',   '0821000057'),
      ('HN0000058', 'ชนะชัย',     'สุขเกษม',      '0821000058'),
      ('HN0000059', 'ศิริพร',     'แววดี',        '0821000059'),
      ('HN0000060', 'บรรจง',      'ฉิมพลี',       '0821000060'),
      ('HN0000061', 'อัญชลี',     'รุ่งเรือง',    '0821000061'),
      ('HN0000062', 'เอกชัย',     'ทาทอง',        '0821000062'),
      ('HN0000063', 'พัชรี',      'จันทร์หอม',    '0821000063'),
      ('HN0000064', 'วันชัย',     'ดีมาก',        '0821000064')
    `);

    // HN0000065–0120 : ยังไม่มีคิว ไว้ทดสอบสร้างเอง (นับใหม่ คนที่1–56)
    await connection.execute(`
      INSERT INTO patient (hn, first_name, last_name, phone_number) VALUES
      ('HN0000065', 'ทดสอบ', 'คนที่1',  '0821000065'),
      ('HN0000066', 'ทดสอบ', 'คนที่2',  '0821000066'),
      ('HN0000067', 'ทดสอบ', 'คนที่3',  '0821000067'),
      ('HN0000068', 'ทดสอบ', 'คนที่4',  '0821000068'),
      ('HN0000069', 'ทดสอบ', 'คนที่5',  '0821000069'),
      ('HN0000070', 'ทดสอบ', 'คนที่6',  '0821000070'),
      ('HN0000071', 'ทดสอบ', 'คนที่7',  '0821000071'),
      ('HN0000072', 'ทดสอบ', 'คนที่8',  '0821000072'),
      ('HN0000073', 'ทดสอบ', 'คนที่9',  '0821000073'),
      ('HN0000074', 'ทดสอบ', 'คนที่10', '0821000074'),
      ('HN0000075', 'ทดสอบ', 'คนที่11', '0821000075'),
      ('HN0000076', 'ทดสอบ', 'คนที่12', '0821000076'),
      ('HN0000077', 'ทดสอบ', 'คนที่13', '0821000077'),
      ('HN0000078', 'ทดสอบ', 'คนที่14', '0821000078'),
      ('HN0000079', 'ทดสอบ', 'คนที่15', '0821000079'),
      ('HN0000080', 'ทดสอบ', 'คนที่16', '0821000080'),
      ('HN0000081', 'ทดสอบ', 'คนที่17', '0821000081'),
      ('HN0000082', 'ทดสอบ', 'คนที่18', '0821000082'),
      ('HN0000083', 'ทดสอบ', 'คนที่19', '0821000083'),
      ('HN0000084', 'ทดสอบ', 'คนที่20', '0821000084'),
      ('HN0000085', 'ทดสอบ', 'คนที่21', '0821000085'),
      ('HN0000086', 'ทดสอบ', 'คนที่22', '0821000086'),
      ('HN0000087', 'ทดสอบ', 'คนที่23', '0821000087'),
      ('HN0000088', 'ทดสอบ', 'คนที่24', '0821000088'),
      ('HN0000089', 'ทดสอบ', 'คนที่25', '0821000089'),
      ('HN0000090', 'ทดสอบ', 'คนที่26', '0821000090'),
      ('HN0000091', 'ทดสอบ', 'คนที่27', '0821000091'),
      ('HN0000092', 'ทดสอบ', 'คนที่28', '0821000092'),
      ('HN0000093', 'ทดสอบ', 'คนที่29', '0821000093'),
      ('HN0000094', 'ทดสอบ', 'คนที่30', '0821000094'),
      ('HN0000095', 'ทดสอบ', 'คนที่31', '0821000095'),
      ('HN0000096', 'ทดสอบ', 'คนที่32', '0821000096'),
      ('HN0000097', 'ทดสอบ', 'คนที่33', '0821000097'),
      ('HN0000098', 'ทดสอบ', 'คนที่34', '0821000098'),
      ('HN0000099', 'ทดสอบ', 'คนที่35', '0821000099'),
      ('HN0000100', 'ทดสอบ', 'คนที่36', '0821000100'),
      ('HN0000101', 'ทดสอบ', 'คนที่37', '0821000101'),
      ('HN0000102', 'ทดสอบ', 'คนที่38', '0821000102'),
      ('HN0000103', 'ทดสอบ', 'คนที่39', '0821000103'),
      ('HN0000104', 'ทดสอบ', 'คนที่40', '0821000104'),
      ('HN0000105', 'ทดสอบ', 'คนที่41', '0821000105'),
      ('HN0000106', 'ทดสอบ', 'คนที่42', '0821000106'),
      ('HN0000107', 'ทดสอบ', 'คนที่43', '0821000107'),
      ('HN0000108', 'ทดสอบ', 'คนที่44', '0821000108'),
      ('HN0000109', 'ทดสอบ', 'คนที่45', '0821000109'),
      ('HN0000110', 'ทดสอบ', 'คนที่46', '0821000110'),
      ('HN0000111', 'ทดสอบ', 'คนที่47', '0821000111'),
      ('HN0000112', 'ทดสอบ', 'คนที่48', '0821000112'),
      ('HN0000113', 'ทดสอบ', 'คนที่49', '0821000113'),
      ('HN0000114', 'ทดสอบ', 'คนที่50', '0821000114'),
      ('HN0000115', 'ทดสอบ', 'คนที่51', '0821000115'),
      ('HN0000116', 'ทดสอบ', 'คนที่52', '0821000116'),
      ('HN0000117', 'ทดสอบ', 'คนที่53', '0821000117'),
      ('HN0000118', 'ทดสอบ', 'คนที่54', '0821000118'),
      ('HN0000119', 'ทดสอบ', 'คนที่55', '0821000119'),
      ('HN0000120', 'ทดสอบ', 'คนที่56', '0821000120')
    `);
    console.log("✅ Patients created (120 คน)");

    // ==================== VISITS ====================
    console.log("📅 Creating visits...");
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = today.toISOString().split("T")[0];
    const vnPrefix = `VN${yy}${mm}${dd}`;

    // สร้าง VN-0001 ถึง VN-0120 ครั้งละ 20 เพื่อไม่ให้ query ยาวเกิน
    for (let batch = 0; batch < 6; batch++) {
      const values = [];
      const params = [];
      for (let i = 1; i <= 20; i++) {
        const seq = batch * 20 + i;
        const vn = `${vnPrefix}-${String(seq).padStart(4, "0")}`;
        values.push("(?, ?, ?, ?)");
        params.push(vn, seq, dateStr, "OPD");
      }
      await connection.execute(
        `INSERT INTO visit (vn, patient_id, visit_date, visit_type) VALUES ${values.join(",")}`,
        params
      );
    }
    console.log("✅ Visits created (120 รายการ)");

    // ==================== QUEUES ====================
    console.log("🎫 Creating queues...");

    // --- คิวตัวอย่างเดิม (visit_id 1–11) ---
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('MED001',  1, 7, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 80 MINUTE), 0, 0),
      ('MED002',  2, 7, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 30 MINUTE), 0, 0),
      ('MED003',  8, 7, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 25 MINUTE), 0, 0),
      ('URO001',  3, 1, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 70 MINUTE), 1, 1),
      ('URO002',  9, 1, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 15 MINUTE), 0, 0),
      ('PED001',  5, 2, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 60 MINUTE), 0, 0),
      ('OBG001',  4, 3, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 70 MINUTE), 0, 0),
      ('OBG002', 10, 3, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 12 MINUTE), 0, 0),
      ('NCD001',  6, 4, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 60 MINUTE), 0, 0),
      ('DIA001',  7, 6, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 50 MINUTE), 0, 0),
      ('DEN001', 11, 9, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 50 MINUTE), 0, 0)
    `);

    // dept 1: URO
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('URO101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000021' AND v.visit_date=CURDATE()), 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 50 MINUTE), 0, 0),
      ('URO102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000022' AND v.visit_date=CURDATE()), 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 40 MINUTE), 1, 0),
      ('URO103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000023' AND v.visit_date=CURDATE()), 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 0, 1),
      ('URO104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000024' AND v.visit_date=CURDATE()), 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // dept 2: PED
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('PED101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000025' AND v.visit_date=CURDATE()), 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 55 MINUTE), 0, 0),
      ('PED102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000026' AND v.visit_date=CURDATE()), 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 45 MINUTE), 2, 0),
      ('PED103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000027' AND v.visit_date=CURDATE()), 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 35 MINUTE), 0, 1),
      ('PED104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000028' AND v.visit_date=CURDATE()), 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // dept 3: OBG
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('OBG101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000029' AND v.visit_date=CURDATE()), 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 48 MINUTE), 0,  0),
      ('OBG102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000030' AND v.visit_date=CURDATE()), 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 35 MINUTE), 2,  0),
      ('OBG103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000031' AND v.visit_date=CURDATE()), 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 0,  1),
      ('OBG104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000032' AND v.visit_date=CURDATE()), 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL  8 MINUTE), 0,  0)
    `);

    // dept 4: NCD
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('NCD101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000033' AND v.visit_date=CURDATE()), 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 42 MINUTE), 0, 0),
      ('NCD102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000034' AND v.visit_date=CURDATE()), 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 1, 0),
      ('NCD103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000035' AND v.visit_date=CURDATE()), 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 18 MINUTE), 0, 1),
      ('NCD104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000036' AND v.visit_date=CURDATE()), 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // dept 5: SPM
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('SPM101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000037' AND v.visit_date=CURDATE()), 5, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 52 MINUTE), 0, 0),
      ('SPM102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000038' AND v.visit_date=CURDATE()), 5, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 38 MINUTE), 1, 0),
      ('SPM103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000039' AND v.visit_date=CURDATE()), 5, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 22 MINUTE), 0, 1),
      ('SPM104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000040' AND v.visit_date=CURDATE()), 5, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 12 MINUTE), 0, 0)
    `);

    // dept 6: DIA
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('DIA101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000041' AND v.visit_date=CURDATE()), 6, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 44 MINUTE), 0, 0),
      ('DIA102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000042' AND v.visit_date=CURDATE()), 6, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 33 MINUTE), 1, 0),
      ('DIA103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000043' AND v.visit_date=CURDATE()), 6, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 0, 1),
      ('DIA104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000044' AND v.visit_date=CURDATE()), 6, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // dept 7: MED
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('MED101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000045' AND v.visit_date=CURDATE()), 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 46 MINUTE), 0, 0),
      ('MED102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000046' AND v.visit_date=CURDATE()), 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 32 MINUTE), 2, 0),
      ('MED103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000047' AND v.visit_date=CURDATE()), 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 25 MINUTE), 0, 1),
      ('MED104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000048' AND v.visit_date=CURDATE()), 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL  5 MINUTE), 0, 0)
    `);

    // dept 8: EYE
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('EYE101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000049' AND v.visit_date=CURDATE()), 8, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 58 MINUTE), 0, 0),
      ('EYE102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000050' AND v.visit_date=CURDATE()), 8, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 36 MINUTE), 1, 0),
      ('EYE103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000051' AND v.visit_date=CURDATE()), 8, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 22 MINUTE), 0, 1),
      ('EYE104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000052' AND v.visit_date=CURDATE()), 8, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // dept 9: DEN
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('DEN101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000053' AND v.visit_date=CURDATE()), 9, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 53 MINUTE), 0, 0),
      ('DEN102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000054' AND v.visit_date=CURDATE()), 9, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 39 MINUTE), 1, 0),
      ('DEN103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000055' AND v.visit_date=CURDATE()), 9, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 24 MINUTE), 0, 1),
      ('DEN104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000056' AND v.visit_date=CURDATE()), 9, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL  9 MINUTE), 0, 0)
    `);

    // dept 10: ENT
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('ENT101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000057' AND v.visit_date=CURDATE()), 10, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 47 MINUTE), 0, 0),
      ('ENT102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000058' AND v.visit_date=CURDATE()), 10, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 32 MINUTE), 2, 0),
      ('ENT103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000059' AND v.visit_date=CURDATE()), 10, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 18 MINUTE), 0, 1),
      ('ENT104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000060' AND v.visit_date=CURDATE()), 10, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // dept 11: SPC
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('SPC101', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000061' AND v.visit_date=CURDATE()), 11, UUID(), 'in_progress', DATE_SUB(NOW(), INTERVAL 43 MINUTE), 0, 0),
      ('SPC102', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000062' AND v.visit_date=CURDATE()), 11, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 29 MINUTE), 0, 0),
      ('SPC103', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000063' AND v.visit_date=CURDATE()), 11, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 15 MINUTE), 0, 1),
      ('SPC104', (SELECT v.visit_id FROM visit v JOIN patient p ON v.patient_id=p.patient_id WHERE p.hn='HN0000064' AND v.visit_date=CURDATE()), 11, UUID(), 'waiting',     DATE_SUB(NOW(), INTERVAL 11 MINUTE), 0, 0)
    `);

    console.log("✅ Queues created");

    // ==================== QUEUE STATUS HISTORY ====================
    console.log("📊 Creating queue status history...");

    // NULL → waiting
    await connection.execute(`
      INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at)
      SELECT queue_id, NULL, 'waiting', 'system', issued_time FROM queue
    `);

    // waiting → in_progress
    await connection.execute(`
      INSERT INTO queue_status_history (queue_id, old_status, new_status, changed_by, changed_at)
      SELECT queue_id, 'waiting', 'in_progress', 'system', DATE_ADD(issued_time, INTERVAL 5 MINUTE)
      FROM queue WHERE status = 'in_progress'
    `);

    console.log("✅ Queue status history created");

    // ==================== SUMMARY ====================
    const [deptCount]    = await connection.execute("SELECT COUNT(*) as count FROM department") as any[];
    const [staffCount]   = await connection.execute("SELECT COUNT(*) as count FROM staff") as any[];
    const [patientCount] = await connection.execute("SELECT COUNT(*) as count FROM patient") as any[];
    const [visitCount]   = await connection.execute("SELECT COUNT(*) as count FROM visit") as any[];
    const [queueCount]   = await connection.execute("SELECT COUNT(*) as count FROM queue") as any[];
    const [histCount]    = await connection.execute("SELECT COUNT(*) as count FROM queue_status_history") as any[];

    console.log("\n✅ Seed completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   Departments   : ${deptCount[0].count}`);
    console.log(`   Staff         : ${staffCount[0].count}`);
    console.log(`   Patients      : ${patientCount[0].count}`);
    console.log(`   Visits        : ${visitCount[0].count}`);
    console.log(`   Queues        : ${queueCount[0].count}`);
    console.log(`   Queue History : ${histCount[0].count}`);

    console.log("\n🔑 Staff Accounts:");
    staffList.forEach(code => {
      console.log(`   ${code} / ${code}123  →  ${staffNames[code]}`);
    });

    console.log(`\n📋 VN Format: ${vnPrefix}-XXXX`);
    console.log(`   ✅ มีคิวแล้ว      : ${vnPrefix}-0001 ถึง ${vnPrefix}-0064`);
    console.log(`   🆕 ทดสอบสร้างเอง : ${vnPrefix}-0065 ถึง ${vnPrefix}-0120`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed()
  .then(() => {
    console.log("\n🎉 Seed script finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed script failed:", error);
    process.exit(1);
  });