import "dotenv/config";
import { pool } from "../src/config/database.js";
import bcrypt from "bcrypt";

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

    const departments = ["uro","ped","obg","ncd","spm","dia","med","eye","den","ent","spc"];
    for (const code of departments) {
      const hash = await bcrypt.hash(`${code}123`, 10);
      await connection.execute(`UPDATE staff SET password = ? WHERE username = ?`, [hash, code]);
    }
    console.log("✅ Staff accounts created");

    // ==================== PATIENTS ====================
    console.log("🏥 Creating patients...");
    await connection.execute(`
      INSERT INTO patient (hn, first_name, last_name, phone_number) VALUES
      ('HN0000001', 'สมชาย',     'ใจดี',        '0909430734'),
      ('HN0000002', 'สมหญิง',    'รักษ์ดี',     '0909390562'),
      ('HN0000003', 'วิชัย',     'สุขสันต์',    '0834567890'),
      ('HN0000004', 'วิภา',      'แสนดี',       '0845678901'),
      ('HN0000005', 'สมศักดิ์',  'เจริญ',       '0856789012'),
      ('HN0000006', 'อรุณี',     'มีสุข',       '0867890123'),
      ('HN0000007', 'ประเสริฐ',  'ดีงาม',       '0878901234'),
      ('HN0000008', 'กานดา',     'สวยงาม',      '0889012345'),
      ('HN0000009', 'สมพร',      'ร่มเย็น',     '0890123456'),
      ('HN0000010', 'ชนิดา',     'แจ่มใส',      '0801234567'),
      ('HN0000011', 'นภา',       'วงศ์สวัสดิ์', '0811111111'),
      ('HN0000012', 'ธนพล',      'มั่นคง',      '0822222222'),
      ('HN0000013', 'รัตนา',     'สุดสวย',      '0833333333'),
      ('HN0000014', 'เอกชัย',    'โชคดี',       '0844444444'),
      ('HN0000015', 'มาลี',      'ใจงาม',       '0855555555'),
      ('HN0000016', 'สุรชัย',    'พรมมา',       '0866666666'),
      ('HN0000017', 'วันดี',     'ศรีสุข',      '0877777777'),
      ('HN0000018', 'ณัฐพล',     'ทองดี',       '0888888888'),
      ('HN0000019', 'พิมพ์ใจ',   'แก้วมณี',     '0899999999'),
      ('HN0000020', 'ชาญณรงค์',  'วิไลพร',      '0800000000'),
      ('HN0000021', 'ทดสอบ', 'VN21',  '0800000021'),
      ('HN0000022', 'ทดสอบ', 'VN22',  '0800000022'),
      ('HN0000023', 'ทดสอบ', 'VN23',  '0800000023'),
      ('HN0000024', 'ทดสอบ', 'VN24',  '0800000024'),
      ('HN0000025', 'ทดสอบ', 'VN25',  '0800000025'),
      ('HN0000026', 'ทดสอบ', 'VN26',  '0800000026'),
      ('HN0000027', 'ทดสอบ', 'VN27',  '0800000027'),
      ('HN0000028', 'ทดสอบ', 'VN28',  '0800000028'),
      ('HN0000029', 'ทดสอบ', 'VN29',  '0800000029'),
      ('HN0000030', 'ทดสอบ', 'VN30',  '0800000030'),
      ('HN0000031', 'ทดสอบ', 'VN31',  '0800000031'),
      ('HN0000032', 'ทดสอบ', 'VN32',  '0800000032'),
      ('HN0000033', 'ทดสอบ', 'VN33',  '0800000033'),
      ('HN0000034', 'ทดสอบ', 'VN34',  '0800000034'),
      ('HN0000035', 'ทดสอบ', 'VN35',  '0800000035'),
      ('HN0000036', 'ทดสอบ', 'VN36',  '0800000036'),
      ('HN0000037', 'ทดสอบ', 'VN37',  '0800000037'),
      ('HN0000038', 'ทดสอบ', 'VN38',  '0800000038'),
      ('HN0000039', 'ทดสอบ', 'VN39',  '0800000039'),
      ('HN0000040', 'ทดสอบ', 'VN40',  '0800000040'),
      ('HN0000041', 'ทดสอบ', 'VN41',  '0800000041'),
      ('HN0000042', 'ทดสอบ', 'VN42',  '0800000042'),
      ('HN0000043', 'ทดสอบ', 'VN43',  '0800000043'),
      ('HN0000044', 'ทดสอบ', 'VN44',  '0800000044'),
      ('HN0000045', 'ทดสอบ', 'VN45',  '0800000045'),
      ('HN0000046', 'ทดสอบ', 'VN46',  '0800000046'),
      ('HN0000047', 'ทดสอบ', 'VN47',  '0800000047'),
      ('HN0000048', 'ทดสอบ', 'VN48',  '0800000048'),
      ('HN0000049', 'ทดสอบ', 'VN49',  '0800000049'),
      ('HN0000050', 'ทดสอบ', 'VN50',  '0800000050'),
      ('HN0000051', 'ทดสอบ', 'VN51',  '0800000051'),
      ('HN0000052', 'ทดสอบ', 'VN52',  '0800000052'),
      ('HN0000053', 'ทดสอบ', 'VN53',  '0800000053'),
      ('HN0000054', 'ทดสอบ', 'VN54',  '0800000054'),
      ('HN0000055', 'ทดสอบ', 'VN55',  '0800000055'),
      ('HN0000056', 'ทดสอบ', 'VN56',  '0800000056'),
      ('HN0000057', 'ทดสอบ', 'VN57',  '0800000057'),
      ('HN0000058', 'ทดสอบ', 'VN58',  '0800000058'),
      ('HN0000059', 'ทดสอบ', 'VN59',  '0800000059'),
      ('HN0000060', 'ทดสอบ', 'VN60',  '0800000060'),
      ('HN0000061', 'ทดสอบ', 'VN61',  '0800000061'),
      ('HN0000062', 'ทดสอบ', 'VN62',  '0800000062'),
      ('HN0000063', 'ทดสอบ', 'VN63',  '0800000063'),
      ('HN0000064', 'ทดสอบ', 'VN64',  '0800000064'),
      ('HN0000065', 'ทดสอบ', 'VN65',  '0800000065'),
      ('HN0000066', 'ทดสอบ', 'VN66',  '0800000066'),
      ('HN0000067', 'ทดสอบ', 'VN67',  '0800000067'),
      ('HN0000068', 'ทดสอบ', 'VN68',  '0800000068'),
      ('HN0000069', 'ทดสอบ', 'VN69',  '0800000069'),
      ('HN0000070', 'ทดสอบ', 'VN70',  '0800000070'),
      ('HN0000071', 'ทดสอบ', 'VN71',  '0800000071'),
      ('HN0000072', 'ทดสอบ', 'VN72',  '0800000072'),
      ('HN0000073', 'ทดสอบ', 'VN73',  '0800000073'),
      ('HN0000074', 'ทดสอบ', 'VN74',  '0800000074'),
      ('HN0000075', 'ทดสอบ', 'VN75',  '0800000075'),
      ('HN0000076', 'ทดสอบ', 'VN76',  '0800000076'),
      ('HN0000077', 'ทดสอบ', 'VN77',  '0800000077'),
      ('HN0000078', 'ทดสอบ', 'VN78',  '0800000078'),
      ('HN0000079', 'ทดสอบ', 'VN79',  '0800000079'),
      ('HN0000080', 'ทดสอบ', 'VN80',  '0800000080'),
      ('HN0000081', 'ทดสอบ', 'VN81',  '0800000081'),
      ('HN0000082', 'ทดสอบ', 'VN82',  '0800000082'),
      ('HN0000083', 'ทดสอบ', 'VN83',  '0800000083'),
      ('HN0000084', 'ทดสอบ', 'VN84',  '0800000084'),
      ('HN0000085', 'ทดสอบ', 'VN85',  '0800000085'),
      ('HN0000086', 'ทดสอบ', 'VN86',  '0800000086'),
      ('HN0000087', 'ทดสอบ', 'VN87',  '0800000087'),
      ('HN0000088', 'ทดสอบ', 'VN88',  '0800000088'),
      ('HN0000089', 'ทดสอบ', 'VN89',  '0800000089'),
      ('HN0000090', 'ทดสอบ', 'VN90',  '0800000090'),
      ('HN0000091', 'ทดสอบ', 'VN91',  '0800000091'),
      ('HN0000092', 'ทดสอบ', 'VN92',  '0800000092'),
      ('HN0000093', 'ทดสอบ', 'VN93',  '0800000093'),
      ('HN0000094', 'ทดสอบ', 'VN94',  '0800000094'),
      ('HN0000095', 'ทดสอบ', 'VN95',  '0800000095'),
      ('HN0000096', 'ทดสอบ', 'VN96',  '0800000096'),
      ('HN0000097', 'ทดสอบ', 'VN97',  '0800000097'),
      ('HN0000098', 'ทดสอบ', 'VN98',  '0800000098'),
      ('HN0000099', 'ทดสอบ', 'VN99',  '0800000099'),
      ('HN0000100', 'ทดสอบ', 'VN100', '0800000100')
    `);
    console.log("✅ Patients created");

    // ==================== VISITS ====================
    console.log("📅 Creating visits...");
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = today.toISOString().split("T")[0];

    await connection.execute(`
      INSERT INTO visit (vn, patient_id, visit_date, visit_type) VALUES
      ('VN${yy}${mm}${dd}-0001',   1, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0002',   2, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0003',   3, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0004',   4, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0005',   5, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0006',   6, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0007',   7, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0008',   8, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0009',   9, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0010',  10, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0011',  11, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0012',  12, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0013',  13, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0014',  14, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0015',  15, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0016',  16, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0017',  17, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0018',  18, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0019',  19, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0020',  20, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0021',  21, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0022',  22, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0023',  23, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0024',  24, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0025',  25, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0026',  26, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0027',  27, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0028',  28, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0029',  29, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0030',  30, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0031',  31, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0032',  32, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0033',  33, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0034',  34, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0035',  35, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0036',  36, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0037',  37, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0038',  38, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0039',  39, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0040',  40, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0041',  41, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0042',  42, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0043',  43, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0044',  44, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0045',  45, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0046',  46, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0047',  47, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0048',  48, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0049',  49, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0050',  50, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0051',  51, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0052',  52, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0053',  53, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0054',  54, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0055',  55, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0056',  56, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0057',  57, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0058',  58, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0059',  59, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0060',  60, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0061',  61, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0062',  62, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0063',  63, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0064',  64, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0065',  65, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0066',  66, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0067',  67, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0068',  68, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0069',  69, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0070',  70, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0071',  71, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0072',  72, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0073',  73, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0074',  74, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0075',  75, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0076',  76, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0077',  77, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0078',  78, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0079',  79, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0080',  80, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0081',  81, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0082',  82, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0083',  83, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0084',  84, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0085',  85, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0086',  86, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0087',  87, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0088',  88, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0089',  89, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0090',  90, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0091',  91, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0092',  92, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0093',  93, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0094',  94, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0095',  95, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0096',  96, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0097',  97, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0098',  98, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0099',  99, '${dateStr}', 'OPD'),
      ('VN${yy}${mm}${dd}-0100', 100, '${dateStr}', 'OPD')
    `);
    console.log("✅ Visits created");

    // ==================== QUEUES ====================
    // กฎ: XXX001 ต้องมี interval มากกว่า XXX002 เสมอ (เก่ากว่า = ขึ้นก่อน)
    console.log("🎫 Creating queues...");

    // 1. อายุรกรรม (MED) - department_id 7
    // MED001(50m) > MED002(40m) > MED003(30m) > MED004(20m) > MED005(10m)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('MED001',  1, 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 50 MINUTE), 0, 0),
      ('MED002',  2, 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 40 MINUTE), 0, 0),
      ('MED003',  3, 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 0, 0),
      ('MED004', 12, 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 0, 0),
      ('MED005', 13, 7, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 1, 0)
    `);

    // 2. ศัลยกรรมทางเดินปัสสาวะ (URO) - department_id 1
    // URO001(50m, skipped) > URO002(30m) > URO003(10m, emergency)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('URO001',  4, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 50 MINUTE), 0, 1),
      ('URO002',  5, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 0, 0),
      ('URO003', 14, 1, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 2, 0)
    `);

    // 3. กุมาร (PED) - department_id 2
    // PED001(30m) > PED002(10m, urgent)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('PED001',  6, 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 0, 0),
      ('PED002', 15, 2, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 1, 0)
    `);

    // 4. สูติ-นรีเวช (OBG) - department_id 3
    // OBG001(40m) > OBG002(25m) > OBG003(10m)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('OBG001',  7, 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 40 MINUTE), 0, 0),
      ('OBG002',  8, 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 25 MINUTE), 0, 0),
      ('OBG003', 16, 3, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // 5. โรคเรื้อรัง (NCD) - department_id 4
    // NCD001(20m) > NCD002(10m, emergency)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('NCD001',  9, 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 0, 0),
      ('NCD002', 17, 4, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 2, 0)
    `);

    // 6. ไตเทียม (DIA) - department_id 6
    // DIA001(20m) > DIA002(10m)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('DIA001', 10, 6, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 0, 0),
      ('DIA002', 18, 6, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
    `);

    // 7. ทันตกรรม (DEN) - department_id 9
    // DEN001(20m) > DEN002(10m, urgent)
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('DEN001', 11, 9, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 0, 0),
      ('DEN002', 19, 9, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 1, 0)
    `);

    // 8. หู คอ จมูก (ENT) - department_id 10
    await connection.execute(`
      INSERT INTO queue (queue_number, visit_id, department_id, queue_token, status, issued_time, priority_score, is_skipped) VALUES
      ('ENT001', 20, 10, UUID(), 'waiting', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 0, 0)
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
    const [deptCount]: any   = await connection.execute("SELECT COUNT(*) as count FROM department");
    const [staffCount]: any  = await connection.execute("SELECT COUNT(*) as count FROM staff");
    const [patientCount]: any = await connection.execute("SELECT COUNT(*) as count FROM patient");
    const [visitCount]: any  = await connection.execute("SELECT COUNT(*) as count FROM visit");
    const [queueCount]: any  = await connection.execute("SELECT COUNT(*) as count FROM queue");

    console.log("\n✅ Seed completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Departments: ${deptCount[0].count}`);
    console.log(`   - Staff:       ${staffCount[0].count}`);
    console.log(`   - Patients:    ${patientCount[0].count}`);
    console.log(`   - Visits:      ${visitCount[0].count}`);
    console.log(`   - Queues:      ${queueCount[0].count}`);

    console.log("\n🎫 Queue Order (เรียงตาม issued_time ASC = ขึ้นก่อน):");
    console.log("   MED: 001(50m) → 002(40m) → 003(30m) → 004(20m) → 005(10m, urgent)");
    console.log("   URO: 001(50m, skipped) | 002(30m) → 003(10m, emergency)");
    console.log("   PED: 001(30m) → 002(10m, urgent)");
    console.log("   OBG: 001(40m) → 002(25m) → 003(10m)");
    console.log("   NCD: 001(20m) → 002(10m, emergency)");
    console.log("   DIA: 001(20m) → 002(10m)");
    console.log("   DEN: 001(20m) → 002(10m, urgent)");
    console.log("   ENT: 001(10m)");

    console.log("\n🔑 Test Accounts:");
    for (const code of ["uro","ped","obg","ncd","spm","dia","med","eye","den","ent","spc"]) {
      console.log(`   - ${code} / ${code}123`);
    }

    console.log(`\n📋 Test VN (Format: VN${yy}${mm}${dd}-XXXX):`);
    console.log(`   ✅ มีคิวแล้ว: VN${yy}${mm}${dd}-0001 ถึง VN${yy}${mm}${dd}-0020`);
    console.log(`   🆕 ทดสอบสร้างคิว: VN${yy}${mm}${dd}-0021 ถึง VN${yy}${mm}${dd}-0100`);
    console.log(`   💡 กรอกแค่ตัวเลขได้ เช่น "21", "50" หรือ "VN21"`);

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