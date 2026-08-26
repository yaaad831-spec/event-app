# 🎟️ EVENT - ระบบกิจกรรมและงานอีเว้นท์ (Event Management System)

เว็บแอปพลิเคชันจัดการกิจกรรมและงานอีเว้นท์แบบ **Full Stack** ที่เชื่อมต่อฐานข้อมูล **Supabase (PostgreSQL, Auth, RLS, Storage)**, พัฒนาด้วย **Next.js 15 (App Router)**, **Tailwind CSS**, และระบบ **AI Assistant** อัจฉริยะที่ดึงข้อมูลจาก Database จริงอย่างปลอดภัย พร้อม Deploy บน **Vercel** ทันที

---

## 🌟 ฟีเจอร์เด่นของระบบ

1. **หน้าเว็บไซต์สำหรับผู้ใช้งานทั่วไป (Frontend)**:
   - **หน้าแรก (Home)**: แบนเนอร์กิจกรรมเด่น, กิจกรรมที่กำลังเปิดรับสมัคร, สถิติจำนวนผู้ลงทะเบียนแบบ Real-time, และหมวดหมู่ลัด
   - **กิจกรรมทั้งหมด (All Events)**: ค้นหาด้วยคีย์เวิร์ด, กรองตามหมวดหมู่, กรองตามวันที่, และกรองตามสถานะ
   - **รายละเอียดกิจกรรม (Event Details)**: แสดงภาพแบนเนอร์, วันที่ 📅, เวลา 🕐, สถานที่ 📍, จำนวนที่รับ 👥, ที่นั่งว่างคงเหลือ, และปุ่มสมัครเข้าร่วม
   - **กิจกรรมของฉัน (My Events)**: รายการกิจกรรมที่ลงทะเบียนไว้ พร้อมบัตรเข้าร่วมงาน (Digital E-Ticket) และปุ่มยกเลิกการสมัครที่คืนที่นั่งสู่ระบบทันที
   - **ระบบสมาชิก (Supabase Auth)**: สมัครสมาชิก, เข้าสู่ระบบ, และแก้ไขโปรไฟล์ส่วนตัว

2. **ระบบผู้ดูแลระบบ (Admin Dashboard)**:
   - **ภาพรวมระบบ (Overview)**: สถิติกิจกรรมทั้งหมด, กิจกรรมเปิดรับ, สมาชิก, ผู้สมัคร, และกราฟ Seat Utilization
   - **จัดการกิจกรรม (Event CRUD)**: เพิ่ม, แก้ไข, ลบ, เปลี่ยนสถานะ (เปิดรับ / เต็ม / จบ / ร่าง), และอัปโหลดภาพขึ้น Supabase Storage
   - **จัดการผู้สมัคร (Registrations)**: ดูรายชื่อผู้สมัครรายกิจกรรม, ค้นหา, และ **Export ข้อมูลเป็นไฟล์ CSV**
   - **จัดการหมวดหมู่ (Categories)**: เพิ่ม แก้ไข ลบหมวดหมู่กิจกรรม
   - **จัดการสมาชิก (User Management)**: ดูรายชื่อและกำหนดสิทธิ์ผู้ใช้ (User / Admin)

3. **ผู้ช่วย AI อัจฉริยะ (AI Assistant Widget)**:
   - Floating Action Button มุมขวาล่าง พร้อมคำถามแนะนำ
   - ดึงข้อมูลกิจกรรมจริงล่าสุดจาก Supabase มาตอบผู้ใช้ (Grounded Context)
   - ไม่แต่งข้อมูลขึ้นมาเอง และไม่เปิดเผย API Key หรือ Secret Key ไปยัง Frontend

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
Event/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # หน้าเข้าสู่ระบบ
│   │   │   └── register/page.tsx       # หน้าสมัครสมาชิก
│   │   ├── (main)/
│   │   │   ├── layout.tsx              # Main layout (Navbar + Footer)
│   │   │   ├── page.tsx                # หน้าแรก
│   │   │   ├── events/page.tsx         # หน้ารวมกิจกรรมและตัวกรอง
│   │   │   ├── events/[id]/page.tsx    # หน้ารายละเอียดกิจกรรม
│   │   │   ├── my-events/page.tsx      # หน้ารายการกิจกรรมของฉัน
│   │   │   └── profile/page.tsx        # หน้าโปรไฟล์ผู้ใช้
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Admin layout พร้อมตรวจสิทธิ์ Role
│   │   │   ├── page.tsx                # Admin Dashboard Overview
│   │   │   ├── events/page.tsx         # จัดการกิจกรรม & อัปโหลดรูป
│   │   │   ├── registrations/page.tsx  # จัดการผู้สมัคร & Export CSV
│   │   │   ├── categories/page.tsx     # จัดการหมวดหมู่
│   │   │   └── users/page.tsx          # จัดการสมาชิกและสิทธิ์
│   │   ├── api/
│   │   │   ├── ai/chat/route.ts        # AI Assistant Endpoint
│   │   │   ├── events/route.ts         # Events API
│   │   │   └── registrations/route.ts  # Registrations API
│   │   ├── globals.css                 # Tailwind styles
│   │   └── layout.tsx                  # Root layout
│   ├── components/
│   │   ├── admin/                      # Admin Sidebar & Header
│   │   ├── ai/                         # AI Chat Widget
│   │   ├── events/                     # EventCard, Filter, RegistrationModal
│   │   └── layout/                     # Navbar, Footer
│   ├── context/
│   │   └── AuthContext.tsx             # Supabase Auth Provider
│   ├── lib/
│   │   ├── supabase/                   # client.ts, server.ts, admin.ts
│   │   ├── services/                   # eventService.ts
│   │   ├── mock-data.ts                # Fallback seed data
│   │   └── utils.ts                    # Thai date & formatting helpers
│   └── types/
│       └── database.ts                 # TypeScript interfaces
├── supabase/
│   ├── schema.sql                      # SQL สร้างตาราง, RLS, Triggers, Storage
│   └── seed.sql                        # ข้อมูลเริ่มต้นกิจกรรมและหมวดหมู่
├── .env.example                        # ตัวอย่าง Environment Variables
└── package.json
```

---

## 🚀 ขั้นตอนการติดตั้งและรันใน Local (Visual Studio Code)

### 1. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจกต์:
```bash
npm install
```

### 2. สร้างฐานข้อมูลใน Supabase
1. ไปที่ [Supabase](https://supabase.com) แล้วสร้างโปรเจกต์ใหม่ (New Project)
2. ไปที่เมนู **SQL Editor** ทางซ้ายมือ
3. เปิดไฟล์ `supabase/schema.sql` ในโปรเจกต์ คัดลอกโค้ดทั้งหมดแล้วนำไปวางใน SQL Editor แล้วกด **Run**
4. เปิดไฟล์ `supabase/seed.sql` คัดลอกโค้ดทั้งหมดแล้วนำไปวางใน SQL Editor แล้วกด **Run** เพื่อเพิ่มข้อมูลกิจกรรมเริ่มต้น

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` ที่ Root Directory แล้วคัดลอกจาก `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ใส่ Google Gemini API Key หรือ Claude / OpenAI เพื่อเปิดใช้ AI เต็มประสิทธิภาพ
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. รันโปรเจกต์
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

---

## 👑 การสร้างบัญชีผู้ดูแลระบบ (Admin Setup)

1. สมัครสมาชิกผ่านหน้าเว็บ `/register` ด้วยอีเมลที่คุณต้องการ (เช่น `admin@event.com`)
2. ไปที่หน้า **Supabase Dashboard > Table Editor > ตาราง `profiles`**
3. ค้นหาอีเมลของคุณ และแก้ไขช่องคอลัมน์ `role` จาก `user` เป็น `admin`
4. รีเฟรชหน้าเว็บ คุณจะสามารถเข้าใช้งานเมนู **Admin Dashboard** (`/admin`) ได้ทันที!

---

## ☁️ การ Deploy บน Vercel

1. Push โค้ดขึ้น **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: event management full stack"
   git remote add origin https://github.com/your-username/event-management.git
   git push -u origin main
   ```
2. ไปที่ [Vercel](https://vercel.com) แล้วกด **Add New > Project**
3. เลือก Repository ที่เพิ่ง push ขึ้นไป
4. ในส่วน **Environment Variables** ให้เพิ่มตัวแปรให้ครบ:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (หรือ `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`)
5. กด **Deploy** และรอระบบ Build เสร็จสิ้น สามารถเข้าใช้งานผ่าน Production URL ได้ทันที!

---

## 🔒 มาตรการความปลอดภัย (Security)
- **Supabase Auth & Password Hashing**: รหัสผ่านถูกเข้ารหัสตามมาตรฐานความปลอดภัยระดับสูง
- **Row Level Security (RLS)**: ป้องกันไม่ให้ผู้ใช้ทั่วไปแก้ไขข้อมูลของผู้อื่นหรือเข้าถึงฟังก์ชัน Admin
- **API Key Protection**: AI API Keys และ Service Role Keys ถูกเก็บและเรียกใช้เฉพาะบน Server-side Route เท่านั้น ไม่มีการส่งออกไปยัง Client
- **Duplicate Prevention**: มี Unique Constraint ป้องกันการสมัครกิจกรรมเดิมซ้ำ
