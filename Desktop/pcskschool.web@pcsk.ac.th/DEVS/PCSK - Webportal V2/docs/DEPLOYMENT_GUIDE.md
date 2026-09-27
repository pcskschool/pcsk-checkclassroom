# คู่มือการติดตั้งและขึ้นระบบ (Deployment & Production Guide)

คู่มือขั้นตอนการนำ **PCSK School Web Portal (V2)** ขึ้นสู่สภาวะแวดล้อมใช้งานจริง (Production) บน **Vercel** ร่วมกับ **Supabase PostgreSQL**

---

## 1. ลำดับการติดตั้งฐานข้อมูลบน Supabase (Database Setup)

ให้นำไฟล์ SQL ในโฟลเดอร์ `supabase/migrations/` ไปรันใน **Supabase Dashboard > SQL Editor** ตามลำดับดังต่อไปนี้:

1. **`20260926000001_initial_schema.sql`**
   * สร้าง Extensions, ฟังก์ชันจัดการเวลา `handle_updated_at`
   * สร้างตาราง: `db_roles`, `db_users`, `db_systems`, `db_user_systems`, `db_role_systems`, `db_announcements`, `db_portal_settings`, `db_audit_logs`
   * ติดตั้ง Trigger `on_auth_user_created` เพื่อสร้าง Profile ใน `db_users` อัตโนมัติเมื่อมีการสมัครหรือสร้างผู้ใช้ใน `auth.users`
2. **`20260926000002_row_level_security.sql`**
   * สร้าง Security Functions: `is_super_admin()`, `can_access_system()`
   * เปิดใช้งาน Row Level Security (RLS) บนทุกตาราง และกำหนด Policies อย่างเคร่งครัด
3. **`20260926000003_seed_data.sql`**
   * นำเข้าบทบาทเริ่มต้น (Super Admin, Executive, Teacher, Staff, Officer)
   * นำเข้าทะเบียนระบบเริ่มต้น 6 ระบบ และผูกสิทธิ์ตามบทบาท
   * บันทึกการตั้งค่าพอร์ทัลกลางและประกาศเริ่มต้น

---

## 2. การสร้างบัญชีผู้ดูแลระบบคนแรก (Initial Super Admin Setup)

1. ไปที่ **Supabase Dashboard > Authentication > Users**
2. คลิก **Add user** > **Create user**
   * Email: อีเมลทางการ เช่น `admin@pcsk.ac.th`
   * Password: รหัสผ่านที่มีความปลอดภัยสูง
   * กำหนด Auto Confirm User เป็นเปิด (Checked)
3. ไปที่ **SQL Editor** เพื่อมอบหมายบทบาท Super Admin ให้กับบัญชีดังกล่าว:
```sql
UPDATE public.db_users
SET role_id = (SELECT id FROM public.db_roles WHERE role_key = 'super_admin' LIMIT 1),
    is_active = TRUE,
    first_name = 'ผู้ดูแลระบบ',
    last_name = 'สูงสุด',
    display_name = 'ผู้ดูแลระบบส่วนกลาง'
WHERE email = 'admin@pcsk.ac.th';
```

---

## 3. รายการตัวแปรแวดล้อมบน Vercel (Environment Variables)

เมื่อทำการเชื่อมต่อ Repository กับ **Vercel** ให้เพิ่ม Environment Variables ในส่วน **Project Settings > Environment Variables**:

| ตัวแปร | ขอบเขต (Scope) | คำอธิบาย |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client + Server) | URL ของ Supabase Project (เช่น `https://xyzcompany.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client + Server) | Public Anon Key สำหรับเบราว์เซอร์ |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret (Server Only)** | Secret Service Role Key (ห้ามมีคำนำหน้า `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_PORTAL_NAME` | Public | ชื่อพอร์ทัล (ค่าเริ่มต้น: `PCSK School Web Portal`) |
| `NEXT_PUBLIC_DEFAULT_INACTIVITY_TIMEOUT_MINUTES` | Public | เวลาตัดเซสชันเริ่มต้น (ค่าเริ่มต้น: `30`) |

> **คำเตือนความปลอดภัย:** ห้ามนำ `SUPABASE_SERVICE_ROLE_KEY` ไปใส่คำนำหน้า `NEXT_PUBLIC_` โดยเด็ดขาด เพราะจะทำให้ความลับหลุดไปยังเบราว์เซอร์ของผู้ใช้งาน

---

## 4. ขั้นตอนการ Deploy บน Vercel (Deployment Steps)

1. Push โค้ดทั้งหมดขึ้นสู่ Git Repository (เช่น GitHub หรือ GitLab)
2. เข้าสู่ Vercel Dashboard คลิก **"Add New Project"** และเลือก Repository
3. ตรวจสอบการตั้งค่า Build:
   * **Framework Preset**: Next.js
   * **Build Command**: `next build` (ค่าเริ่มต้น)
   * **Output Directory**: `.next` (ค่าเริ่มต้น)
   * **Install Command**: `npm install`
4. กรอกตัวแปรแวดล้อมตามตารางในข้อ 3 ให้ครบถ้วน
5. กดปุ่ม **"Deploy"**

---

## 5. การตรวจสอบความพร้อมหลังขึ้นระบบ (Post-Deployment Verification)

- [ ] หน้าแรก (`/`) โหลดได้รวดเร็ว ฟอนต์ Prompt และสีของโรงเรียนแสดงผลถูกต้อง
- [ ] หน้าล็อกอิน (`/login`) แสดงประกาศของผู้ดูแลระบบ และแสดง Error ภาษาไทยที่สุภาพเมื่อกรอกรหัสผ่านผิด
- [ ] ล็อกอินด้วยบัญชี Super Admin สำเร็จ และถูกส่งไปยัง `/dashboard` โดยอัตโนมัติ
- [ ] เมนูแถบข้าง (Sidebar) แสดงหมวดหมู่งาน 6 กลุ่มภาษาไทยครบถ้วน
- [ ] หน้าต่างเตือน Inactivity Timeout ปรากฏขึ้นเมื่อทดสอบตั้งเวลาสั้น และสามารถกด "ขยายเวลาการใช้งาน" ได้
- [ ] หน้าจัดการทะเบียนระบบ (`/admin/systems`) และจัดการผู้ใช้ (`/admin/users`) สามารถเปิด/ปิดสถานะและบันทึกประวัติลง `db_audit_logs` ได้จริง
