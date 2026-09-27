# ระบบการออกแบบกลาง (PCSK Shared Design System)

เอกสารมาตรฐานการออกแบบ คู่มือการใช้งานคอมโพเนนต์ และแนวทางการพัฒนา UI สำหรับทุกระบบงานย่อย

---

## 1. ปรัชญาการออกแบบ (Design Principles)

1. **One Unified Language**: ทุกระบบต้องใช้ภาษาภาพเดียวกัน (สไตล์งานสารสนเทศราชการ/องค์กรการศึกษา สุภาพ เป็นทางการ เรียบง่าย มั่นคง)
2. **Zero Design Drift**: ห้ามระบบย่อยเปลี่ยนโทนสี, ฟอนต์, สไตล์ปุ่ม, กล่องข้อมูล, หรือการแจ้งเตือนโดยพลการ
3. **Tailwind First**: ใช้ Utility Classes ของ Tailwind เป็นหลัก หลีกเลี่ยง Custom CSS หากไม่จำเป็น
4. **Base Font Size ≥ 16px**: ตัวอักษรเนื้อหาหลักต้องไม่เล็กกว่า 16px เพื่อการอ่านที่สบายตาบนทุกอุปกรณ์
5. **Accessibility & Contrast**: การโฟกัสด้วยคีย์บอร์ดใช้สีเขียว `ring-2 ring-green-600` ที่ชัดเจน

---

## 2. โทนสีมาตรฐาน (Color Palette)

* **Neutral Palette (สีกลาง)**:
  * `Slate` / `Zinc`: ใช้สำหรับพื้นหลัง, เส้นขอบ, ตัวอักษรหลัก และสถานะทั่วไป
* **Brand Primary Accent (สีหลักของโรงเรียน)**:
  * `Green` (`green-700`, `green-800`, `green-900`): ใช้สำหรับการนำทางหลัก, ปุ่มดำเนินการสำคัญ (Primary Action), สถานะเปิดใช้งาน, และ Focus Rings
* **Surface (พื้นผิว)**:
  * `White` (`#ffffff`): ใช้สำหรับการ์ด, ตาราง, โมดัล และแผงข้อมูล

---

## 3. รายการคอมโพเนนต์กลาง (`@/components/ui`)

### 3.1 Button
```tsx
import { Button } from "@/components/ui";

// Primary Green
<Button variant="primary">บันทึกข้อมูล</Button>

// Secondary Slate
<Button variant="secondary">ย้อนกลับ</Button>

// Outline
<Button variant="outline">ส่งออกไฟล์ Excel</Button>

// Danger
<Button variant="danger">ลบรายการ</Button>

// Loading State (ป้องกันการกดซ้ำ)
<Button isLoading={true}>กำลังประมวลผล</Button>
```

### 3.2 Form Controls (Input, Select, Textarea, Checkbox)
```tsx
import { Input, Select, Textarea, Checkbox } from "@/components/ui";

<Input
  label="ชื่อ-นามสกุล"
  required
  placeholder="กรอกชื่อและนามสกุล"
  error={errors.fullName}
/>

<Select
  label="หมวดหมู่งาน"
  required
  options={[
    { value: "academic", label: "งานวิชาการ" },
    { value: "admin", label: "งานบริหาร" },
  ]}
/>

<Textarea
  label="บันทึกข้อความ"
  rows={4}
  helperText="ระบุรายละเอียดไม่เกิน 500 ตัวอักษร"
/>

<Checkbox
  label="ยอมรับเงื่อนไขการใช้งาน"
  description="ข้อมูลจะถูกบันทึกเพื่อตรวจสอบประวัติการปฏิบัติงาน"
/>
```

### 3.3 Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";

<Card>
  <CardHeader bordered>
    <CardTitle>ข้อมูลสรุปประจำวัน</CardTitle>
    <CardDescription>แสดงสถิติการมาเรียนของนักเรียน</CardDescription>
  </CardHeader>
  <CardContent className="pt-4">
    เนื้อหา...
  </CardContent>
  <CardFooter bordered>
    <Button size="sm">ดูรายละเอียด</Button>
  </CardFooter>
</Card>
```

### 3.4 Badge (สถานะ)
```tsx
import { Badge } from "@/components/ui";

<Badge variant="success" dot>เปิดใช้งานปกติ</Badge>
<Badge variant="warning" dot>รอดำเนินการ</Badge>
<Badge variant="danger" dot>ปิดปรับปรุงชั่วคราว</Badge>
```

### 3.5 Alert & System Announcement
```tsx
import { Alert } from "@/components/ui";
import { AnnouncementBanner } from "@/components/core/announcement-banner";

// ป้ายประกาศประจำระบบด้านบนสุดของหน้า
<AnnouncementBanner
  title="📢 ประกาศ"
  content="กรุณาตรวจสอบข้อมูลผลการเรียนก่อนกดยืนยันส่งฝ่ายวิชาการ"
  type="warning"
/>

// กล่องแจ้งเตือนทั่วไป
<Alert variant="info" title="คำแนะนำ">
  สามารถกดปุ่มค้นหาเพื่อกรองรายชื่อตามห้องเรียนได้
</Alert>
```

### 3.6 Modal & ConfirmDialog
```tsx
import { Modal, ConfirmDialog, Button } from "@/components/ui";

<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="ยืนยันการลบข้อมูล"
  message="การดำเนินการนี้ไม่สามารถเรียกคืนได้ ต้องการดำเนินการต่อหรือไม่?"
  variant="danger"
  confirmLabel="ยืนยันการลบ"
/>
```

### 3.7 Table & Pagination
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from "@/components/ui";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>รหัส</TableHead>
      <TableHead>ชื่อระบบ</TableHead>
      <TableHead>สถานะ</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>sys001</TableCell>
      <TableCell>ระบบงานสารบรรณ</TableCell>
      <TableCell><Badge variant="success">เปิดใช้งาน</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>

<Pagination
  currentPage={1}
  totalPages={5}
  totalItems={50}
  pageSize={10}
  onPageChange={(page) => console.log(page)}
/>
```

### 3.8 MaintenancePage (โหมดปรับปรุงระบบ)
```tsx
import { MaintenancePage } from "@/components/core/maintenance-page";

// ใช้เมื่อระบบถูกตั้งค่า is_maintenance = true
<MaintenancePage
  systemTitle="ระบบงานพัสดุและสินทรัพย์สถานศึกษา"
  explanation="ระบบกำลังปิดให้บริการชั่วคราวเพื่อดำเนินการตรวจสอบยอดครุภัณฑ์ประจำปี"
/>
```

### 3.9 IconResolver (ไอคอนจากฐานข้อมูล)
```tsx
import { IconResolver } from "@/components/ui";

// ปลอดภัยจากการ inject HTML โดยแปลงคีย์ข้อความจาก DB ไปเป็น Lucide Icon
<IconResolver name="graduation-cap" className="w-6 h-6 text-green-700" />
```
