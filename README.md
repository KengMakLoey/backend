# backend
Backend development of Nakornping Q project by KengMakLoey Team, a prototype queueing system for Nakornping Hospital.

## Setup
DB
1. docker compose up -d 
2. npm run db:generate
3. npm run db:push
(ถ้า database schema มีการเปลี่ยนแปลงให้ docker compose down -v แล้วเริ่มตั้งแต่ข้อ1.ใหม่)

backend
1. ลบ .example ออกจากชื่อไฟล์ .env.example
2. ลบ .example ออกจากชื่อไฟล์ .npmrc.example (แล้ว uncomment shell ที่ตัวเองใช้)
3. pnpm install
4. pnpm run dev