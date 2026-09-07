# EventHub – ระบบกิจกรรมและงานอีเว้นต์

เว็บแอปพลิเคชันสำหรับค้นหา ดูรายละเอียด และลงทะเบียนเข้าร่วมกิจกรรม/งานอีเว้นต์
พัฒนาด้วย **HTML5 + CSS3 + JavaScript (Vanilla)** ล้วน ๆ ไม่มี Backend และไม่ใช้ Framework
ใช้ **LocalStorage** เป็นฐานข้อมูลจำลอง ข้อมูลจะยังอยู่แม้ Refresh หน้าเว็บ

## วิธีเปิดใช้งาน

เปิดไฟล์ `index.html` ด้วยเบราว์เซอร์ได้ทันที (แนะนำให้เปิดผ่าน Live Server หรือรันเซิร์ฟเวอร์ static
เช่น `npx serve` เพื่อให้ฟอนต์ Google Fonts และ path โหลดได้สมบูรณ์ แต่เปิดไฟล์ตรง ๆ ก็ใช้งานได้เช่นกัน)

## บัญชีทดลอง

| บทบาท | อีเมล | รหัสผ่าน |
|---|---|---|
| User | user@eventhub.com | 1234 |
| Organizer | organizer@eventhub.com | 1234 |

หรือกด "สมัครสมาชิก" เพื่อสร้างบัญชีใหม่ทั้งแบบ User และ Organizer ได้

## โครงสร้างไฟล์

```
EventHub/
│
├── index.html      โครงหน้าเว็บทั้งหมด (ทุกหน้าเป็น Section ที่สลับแสดงผลด้วย JS)
├── style.css       ดีไซน์ทั้งหมด โทนสีฟ้า-ขาว-ครีม, Responsive
├── script.js       Logic ทั้งหมด: DB Layer, Router, Render, Event Handlers
│
├── assets/
│   ├── images/
│   └── icons/
│
└── README.md
```

## สถาปัตยกรรมของระบบ

เว็บนี้เป็น **Single Page Application (SPA)** ทุก "หน้า" ถูกเขียนไว้ใน `index.html` เป็น
`<section class="page">` และสลับแสดง/ซ่อนด้วย JavaScript Router (`script.js`) โดยอิงจาก URL Hash
เช่น `#/home`, `#/explore`, `#/event/<id>` ทำให้ทุกหน้าเชื่อมต่อกันผ่านลิงก์และปุ่มต่าง ๆ ได้จริง

## ฐานข้อมูลจำลอง (LocalStorage)

เก็บเป็น 4 ตาราง (JSON array) ภายใต้ key ดังนี้:

- `eh_users` — บัญชีผู้ใช้ (User / Organizer)
- `eh_events` — ข้อมูลกิจกรรม
- `eh_registrations` — การลงทะเบียนเข้าร่วมกิจกรรม (เชื่อม Users ↔ Events)
- `eh_favorites` — กิจกรรมที่บันทึกไว้ (เชื่อม Users ↔ Events)
- `eh_session` — เก็บ UserID ของผู้ที่ Login อยู่ปัจจุบัน

## Logic สำคัญที่ Implement ไว้

- **Login / Register** ตรวจสอบอีเมล-รหัสผ่านจริงจาก LocalStorage และแยกเส้นทางตาม Role
- **ค้นหา + Filter หมวดหมู่** ในหน้า Explore (และช่องค้นหาในหน้า Home ที่ส่งต่อไปหน้า Explore)
- **ลงทะเบียนกิจกรรม** ตรวจสอบว่าลงแล้วหรือยัง และตรวจสอบที่นั่งว่างก่อนบันทึก พร้อมอัปเดตสถานะ
  กิจกรรมเป็น "เต็ม" อัตโนมัติเมื่อที่นั่งเต็ม (`remainingSeats = Capacity - จำนวนลงทะเบียนที่ Status = Registered`)
- **ยกเลิกการลงทะเบียน** พร้อม Confirm Dialog และอัปเดตจำนวนที่นั่งกลับคืน
- **Favorite** สลับ ♡ ↔ ❤️ และเพิ่ม/ลบข้อมูลใน `eh_favorites`
- **Organizer Dashboard** สรุปสถิติ + ตารางกิจกรรมพร้อมปุ่มแก้ไข/ลบ/ดูรายชื่อผู้เข้าร่วม
- **Admin Dashboard** เพิ่มสถิติกิจกรรมที่กำลังจะมาถึง, กราฟตามหมวดหมู่, เปิด/ปิดรับสมัคร และลิงก์ดูรายละเอียด
- **จัดการผู้เข้าร่วม** ค้นหาผู้สมัคร, ดูข้อมูล, เปลี่ยนสถานะ, เช็คอิน และ Export CSV
- **จัดการผู้ใช้** ค้นหาสมาชิก, เปลี่ยนบทบาท User/Admin และเปิด/ปิดบัญชี
- **รายงาน** สรุปจำนวนกิจกรรม, ผู้สมัคร, ผู้เข้าร่วม และสถิติแยกตามกิจกรรม พร้อม Export CSV
- **ตั้งค่า** แก้ไขชื่อเว็บไซต์, คำอธิบาย และเปิด/ปิดการสมัครสมาชิกใหม่
- **Create / Edit Event** ใช้ฟอร์มเดียวกัน, สร้าง EventID อัตโนมัติ, สถานะเริ่มต้น "เปิดรับสมัคร"
- **Delete Event** มี Confirm Dialog และลบ Registrations/Favorites ที่เกี่ยวข้องทั้งหมด (Cascade Delete)
- **Participants List** แสดงรายชื่อผู้ลงทะเบียนของกิจกรรมนั้น ๆ พร้อมสถานะ Check-in
- **Responsive** รองรับ Desktop (Grid 3–4 คอลัมน์) / Tablet (2 คอลัมน์) / Mobile (1 คอลัมน์ + เมนูแบบมือถือ)

## Checklist การทดสอบ

- [x] Login ใช้งานได้ (ทั้งบัญชีทดลองและบัญชีที่สมัครใหม่)
- [x] Register ใช้งานได้ทั้ง Role User และ Organizer
- [x] Search ใช้งานได้ (หน้า Home และ Explore)
- [x] Filter หมวดหมู่ใช้งานได้
- [x] Event Detail แสดงข้อมูลครบและเชื่อมโยงกับ Action ต่าง ๆ
- [x] Favorite บันทึก/ลบได้ และแสดงผลในหน้าโปรไฟล์
- [x] Register Event ใช้งานได้ พร้อมตรวจสอบที่นั่ง
- [x] Cancel Registration ใช้งานได้
- [x] Organizer Dashboard แสดงสถิติและตารางถูกต้อง
- [x] Admin Dashboard แสดงการ์ดสรุปและกราฟหมวดหมู่
- [x] เปิด/ปิดการรับสมัครกิจกรรมได้
- [x] ค้นหา/จัดการผู้สมัครและ Export CSV ได้
- [x] จัดการสมาชิก บทบาท และสถานะบัญชีได้
- [x] รายงานและตั้งค่าระบบบันทึกใน LocalStorage ได้
- [x] Create Event ใช้งานได้
- [x] Edit Event ใช้งานได้
- [x] Delete Event ใช้งานได้ (พร้อม Cascade ลบข้อมูลที่เกี่ยวข้อง)
- [x] Participant List แสดงรายชื่อผู้เข้าร่วมถูกต้อง
- [x] LocalStorage บันทึกและคงข้อมูลอยู่แม้ Refresh หน้าเว็บ
- [x] Responsive ทำงานได้ทั้ง Desktop / Tablet / Mobile
