# คู่มือการพัฒนาโมดูลระบบย่อย (System Module Development Guide)

คู่มือและมาตรฐานสำหรับวิศวกรซอฟต์แวร์ในการพัฒนาและเพิ่มระบบงานย่อยใหม่เข้าสู่ **PCSK School Web Portal** โดยปฏิบัติตามกฎเหล็ก **"BUILD THE PORTAL ONCE. BUILD SYSTEMS AS MODULES."**

---

## 1. กฎพื้นฐานที่ต้องปฏิบัติอย่างเคร่งครัด (Non-Negotiable Rules)

1. **ห้ามสร้างฟังก์ชัน Portal Core ซ้ำซ้อน (No Core Duplication)**:
   * **ห้าม** สร้างแถบเมนูข้าง (Sidebar) ใหม่
   * **ห้าม** สร้างแถบเมนูด้านบน (Topbar) ใหม่
   * **ห้าม** สร้างฟังก์ชันจับเวลา Inactivity Timeout หรือระบบ Authentication ใหม่
   * **ห้าม** ออกแบบธีมสี ฟอนต์ หรือปุ่มกดใหม่โดยพลการ
2. **การใช้ซ้ำคอมโพเนนต์กลาง 100% (Component Reuse Rule)**:
   * ดึงคอมโพเนนต์จาก `@/components/ui` เสมอ (Button, Input, Select, Textarea, Card, Badge, Alert, Modal, Table, Pagination, Skeleton, EmptyState)
3. **UX ภาษาไทย 100% (Strict Human-Readable Thai UX)**:
   * **ห้ามเปิดเผย Technical Names สู่ผู้ใช้เด็ดขาด** (เช่น ห้ามแสดง `sys001`, `doc_id`, `created_at`, `db_status` ในหน้าจอ) ให้แปลงเป็นภาษาไทยทางการ เช่น "ระบบงานสารบรรณ", "วันที่ลงรับ", "สถานะเอกสาร"
4. **ขอบเขต Custom CSS (Custom CSS Scoping Rule)**:
   * ใช้ Tailwind CSS เป็นหลัก หากจำเป็นต้องเขียน CSS เพิ่มเติม ต้องขึ้นต้นด้วยรหัสระบบเท่านั้น เช่น `.sys001_report_table` หรือ `.sys002_chart_container` ห้ามใช้ชื่อคลาสลอย ๆ เช่น `.custom-card` หรือ `.box`

---

## 2. ขั้นตอนการเพิ่มระบบงานใหม่ (Step-by-Step System Creation)

สมมติว่าต้องการเพิ่มระบบงานใหม่ เช่น **ระบบงานวัดและประเมินผลการเรียน (`sys002`)**

### ขั้นตอนที่ 1: ลงทะเบียนระบบในฐานข้อมูล (Database Registration)
บันทึกข้อมูลระบบลงในตาราง `db_systems` ผ่าน SQL หรือ Supabase Studio:
```sql
INSERT INTO public.db_systems (
  system_code,
  name,
  display_name,
  description,
  system_group,
  icon_key,
  route_or_url,
  system_type,
  is_active,
  is_maintenance,
  sort_order
) VALUES (
  'sys002',
  'academic_evaluation',
  'ระบบงานวัดและประเมินผลการเรียน',
  'บันทึกคะแนนเก็บ คะแนนสอบ และออกรายงานผลการเรียน ปพ. ทุกระดับชั้น',
  'งานวิชาการ',
  'graduation-cap',
  '/systems/sys002',
  'internal',
  TRUE,
  FALSE,
  2
);
```

### ขั้นตอนที่ 2: ผูกสิทธิ์การเข้าถึงให้แก่ Role หรือ User
```sql
-- ผูกสิทธิ์ให้ครูผู้สอน (teacher) เข้าถึงระบบ sys002 ได้
INSERT INTO public.db_role_systems (role_id, system_id)
SELECT r.id, s.id
FROM public.db_roles r, public.db_systems s
WHERE r.role_key = 'teacher' AND s.system_code = 'sys002';
```
*(เมื่อผูกสิทธิ์แล้ว ระบบจะปรากฏบน Dashboard และ Sidebar ของผู้ใช้ทันทีโดยอัตโนมัติ)*

### ขั้นตอนที่ 3: สร้างโครงสร้างโฟลเดอร์โมดูล
สร้างโฟลเดอร์สำหรับระบบงานใหม่ภายใต้ `systems/`:
```text
systems/sys002/
├── components/       # คอมโพเนนต์เฉพาะทางของระบบ (เช่น ScoreEntryTable, GradeReportCard)
├── services/         # ฟังก์ชันดึงและบันทึกข้อมูล Supabase
├── types/            # Type definitions เฉพาะทาง (เช่น GradeRecord, Subject)
└── constants/        # ค่าคงที่ภาษาไทย (เช่น เกรด, สถานะการผ่านประเมิน)
```

### ขั้นตอนที่ 4: สร้าง Route หน้าจอใน Next.js App Router
สร้างไฟล์ `app/(portal)/systems/sys002/page.tsx`:
```tsx
import { getSystemByCode } from "@/lib/services/portal-data";
import { MaintenancePage } from "@/components/core/maintenance-page";
import { Sys002Client } from "@/systems/sys002/components/sys002-client";

export const metadata = {
  title: "ระบบงานวัดและประเมินผลการเรียน",
};

export default async function Sys002Page() {
  const system = await getSystemByCode("sys002");

  // ตรวจสอบโหมดปรับปรุงระบบเสมอ
  if (system?.is_maintenance) {
    return (
      <MaintenancePage
        systemTitle={system.display_name}
        explanation={system.maintenance_message}
        returnUrl="/dashboard"
      />
    );
  }

  return <Sys002Client />;
}
```

---

## 3. ตัวอย่างการใช้คอมโพเนนต์กลางในระบบย่อย

```tsx
import { PageHeader } from "@/components/core/page-header";
import { AnnouncementBanner } from "@/components/core/announcement-banner";
import { Button, Input, Table, Badge } from "@/components/ui";

export function Sys002Client() {
  return (
    <div className="space-y-6">
      {/* 1. Page Header มาตรฐาน */}
      <PageHeader
        title="บันทึกผลการเรียนระดับชั้นประถมศึกษาปีที่ 1"
        description="กลุ่มสาระการเรียนรู้คณิตศาสตร์ ภาคเรียนที่ 1/2568"
        breadcrumbs={[
          { label: "งานวิชาการ", href: "/dashboard" },
          { label: "ระบบงานวัดผล", isCurrent: true },
        ]}
        badge={<Badge variant="success" dot>เปิดบันทึกคะแนน</Badge>}
        actions={<Button variant="primary">ส่งออก ปพ.5</Button>}
      />

      {/* 2. Announcement Banner ประจำระบบ */}
      <AnnouncementBanner
        content="กำหนดส่งผลคะแนนเก็บภายในวันที่ 30 กันยายน 2568"
        type="warning"
      />

      {/* 3. เนื้อหาและตารางที่ใช้ UI กลาง */}
      ...
    </div>
  );
}
```

---

## 4. Checklist การตรวจสอบก่อนส่งมอบระบบใหม่ (Pre-flight Checklist)

- [ ] ระบบถูกลงทะเบียนใน `db_systems` และกำหนดสิทธิ์ใน `db_role_systems` หรือ `db_user_systems`
- [ ] มีการตรวจสอบสถานะ `is_maintenance` เพื่อแสดง `MaintenancePage` อัตโนมัติ
- [ ] นำเข้าคอมโพเนนต์ Button, Input, Table, Modal จาก `@/components/ui` ทั้งหมด
- [ ] ไม่มีข้อความ Database Column, Technical Field Name, หรือรหัส `sysXXX` หลุดไปสู่หน้าจอของผู้ใช้ทั่วไป
- [ ] รันคำสั่ง `npm run build` ผ่านสมบูรณ์ ปราศจาก Type Error
