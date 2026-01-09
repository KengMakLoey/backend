# backend
Backend development of Nakornping Q project by KengMakLoey Team, a prototype queueing system for Nakornping Hospital.

## Setup
DB
1. docker compose up -d 
2. npm run db:generate
3. npm run db:push
การนำตัวอย่างข้อมูลลงในดาต้าเบส -> npm run seed 
(ถ้า database schema มีการเปลี่ยนแปลงให้ docker compose down -v แล้วเริ่มตั้งแต่ข้อ1.ใหม่)

backend
1. สร้างไฟล์ .env แล้ว copy ข้อมูลมาจาก .env.example
2. สร้างไฟล์ .example แล้ว copy ข้อมูลมาจาก .npmrc.example จากนั้น uncomment shell ที่ตัวเองใช้ (CRLF -> LF)
3. pnpm install
4. pnpm run dev

DBeaver Connection
MySQL port 3306
database: mydb
username: root
password: password