"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Alert,
  Modal,
  ConfirmDialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Skeleton,
  CardSkeleton,
  Spinner,
  EmptyState,
  IconResolver,
} from "@/components/ui";
import { AnnouncementBanner } from "@/components/core/announcement-banner";
import { 
  Palette, 
  ArrowLeft, 
  Search, 
  Download, 
  Trash2, 
  Plus, 
  Layers, 
  ShieldCheck, 
  Check, 
  HelpCircle 
} from "lucide-react";

import { PageHeader } from "@/components/core/page-header";

export default function DesignSystemShowcasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingButton, setIsLoadingButton] = useState(false);

  const toggleLoading = () => {
    setIsLoadingButton(true);
    setTimeout(() => setIsLoadingButton(false), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Standard Page Header */}
      <PageHeader
        title="แบบจำลองคอมโพเนนต์กลาง (Design System Showcase)"
        description="คอมโพเนนต์มาตรฐานสำหรับทุกโมดูลระบบย่อย ห้ามเปลี่ยนแปลงรูปแบบเพื่อรักษาความสม่ำเสมอ 100%"
        breadcrumbs={[
          { label: "คู่มือระบบการออกแบบ", isCurrent: true },
        ]}
        badge={
          <Badge variant="success" dot>
            Shared Design System
          </Badge>
        }
        actions={
          <Link href="/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              กลับหน้าแผงควบคุม
            </Button>
          </Link>
        }
      />

        {/* Section 1: System Announcement & Alerts */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-700" />
            <span>1. ประกาศและข้อความแจ้งเตือน (System Announcements & Alerts)</span>
          </h2>

          <AnnouncementBanner
            title="📢 ประกาศประจำระบบงาน"
            content="กรุณาตรวจสอบข้อมูลผลการเรียนก่อนกดยืนยันส่งฝ่ายวิชาการภายในวันที่ 30 กันยายนนี้"
            type="info"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert variant="info" title="ข้อมูลข่าวสาร">
              ระบบกำลังเชื่อมต่อกับฐานข้อมูลกลางของสถานศึกษา
            </Alert>
            <Alert variant="success" title="ดำเนินการสำเร็จ">
              บันทึกข้อมูลและส่งออกรายงานเรียบร้อยแล้ว
            </Alert>
            <Alert variant="warning" title="คำเตือน">
              รายการนี้กำลังจะหมดอายุในอีก 3 วัน
            </Alert>
            <Alert variant="danger" title="ข้อผิดพลาด">
              ไม่สามารถเข้าถึงฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง
            </Alert>
          </div>
        </section>

        {/* Section 2: Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-700" />
            <span>2. ปุ่มกดมาตรฐาน (Buttons & States)</span>
          </h2>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">รูปแบบปุ่ม (Variants)</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                    Primary Action (Green)
                  </Button>
                  <Button variant="secondary">
                    Secondary (Slate)
                  </Button>
                  <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                    Outline Button
                  </Button>
                  <Button variant="ghost">
                    Ghost Button
                  </Button>
                  <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
                    Danger Button
                  </Button>
                  <Button variant="success" leftIcon={<Check className="w-4 h-4" />}>
                    Success Button
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">สถานะและขนาด (States & Sizes)</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">ขนาดเล็ก (sm)</Button>
                  <Button size="md">ขนาดปกติ (md)</Button>
                  <Button size="lg">ขนาดใหญ่ (lg)</Button>
                  <Button
                    isLoading={isLoadingButton}
                    onClick={toggleLoading}
                  >
                    {isLoadingButton ? "กำลังบันทึก..." : "คลิกทดสอบ Loading"}
                  </Button>
                  <Button disabled>
                    ปุ่มปิดใช้งาน (Disabled)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Form Controls */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-700" />
            <span>3. ส่วนควบคุมแบบฟอร์ม (Form Controls)</span>
          </h2>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="ชื่อระบบงาน"
                  required
                  placeholder="เช่น ระบบงานทะเบียนนักเรียน"
                  helperText="ระบุชื่อทางการที่สื่อความหมายชัดเจน"
                />

                <Input
                  label="อีเมลผู้รับผิดชอบ"
                  required
                  type="email"
                  defaultValue="invalid-email"
                  error="รูปแบบอีเมลไม่ถูกต้อง กรุณากรอกใหม่อีกครั้ง"
                />

                <Select
                  label="หมวดหมู่งานหลัก (System Group)"
                  required
                  options={[
                    { value: "admin", label: "งานบริหาร" },
                    { value: "academic", label: "งานวิชาการ" },
                    { value: "personnel", label: "งานบุคลากร" },
                    { value: "student", label: "งานนักเรียน" },
                    { value: "it", label: "งานสารสนเทศ" },
                    { value: "general", label: "งานทั่วไป" },
                  ]}
                />

                <Input
                  label="ค้นหารายการ"
                  placeholder="พิมพ์คำค้นหา..."
                  leftIcon={<Search className="w-4 h-4" />}
                />

                <div className="md:col-span-2">
                  <Textarea
                    label="รายละเอียดหรือหมายเหตุ"
                    rows={3}
                    placeholder="กรอกรายละเอียดเพิ่มเติมที่นี่..."
                    helperText="ความยาวไม่เกิน 500 ตัวอักษร"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <Checkbox
                    label="เปิดใช้งานระบบนี้ในหน้าแรกของพอร์ทัลทันที"
                    description="เมื่อเลือก ผู้ใช้ที่มีสิทธิ์จะมองเห็นการ์ดระบบนี้บนแดชบอร์ด"
                    defaultChecked
                  />
                  <Checkbox
                    label="เข้าสู่โหมดปิดปรับปรุงระบบชั่วคราว (Maintenance Mode)"
                    description="ผู้ใช้งานทั่วไปจะไม่สามารถเข้าถึงหน้างานได้ และจะแสดงหน้าปรับปรุงระบบแทน"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Badges & Status Tags */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-700" />
            <span>4. ป้ายสถานะ (Badges & Status Tags)</span>
          </h2>

          <Card>
            <CardContent className="p-6 flex flex-wrap gap-3">
              <Badge variant="success" dot>เปิดใช้งานปกติ</Badge>
              <Badge variant="warning" dot>รอดำเนินการ</Badge>
              <Badge variant="danger" dot>ปิดปรับปรุงชั่วคราว</Badge>
              <Badge variant="info" dot>ระบบภายนอก (External)</Badge>
              <Badge variant="default">ฉบับร่าง (Draft)</Badge>
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Data Table & Pagination */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-700" />
            <span>5. ตารางข้อมูลและการแบ่งหน้า (Table & Pagination)</span>
          </h2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>ชื่อระบบงานภาษาไทย</TableHead>
                <TableHead>หมวดหมู่งาน</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs text-slate-500">sys001</TableCell>
                <TableCell className="font-semibold text-slate-900">ระบบงานสารบรรณอิเล็กทรอนิกส์</TableCell>
                <TableCell>งานบริหาร</TableCell>
                <TableCell>ภายใน</TableCell>
                <TableCell><Badge variant="success" dot>เปิดใช้งาน</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">แก้ไข</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs text-slate-500">sys002</TableCell>
                <TableCell className="font-semibold text-slate-900">ระบบงานวัดและประเมินผลการเรียน</TableCell>
                <TableCell>งานวิชาการ</TableCell>
                <TableCell>ภายใน</TableCell>
                <TableCell><Badge variant="success" dot>เปิดใช้งาน</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">แก้ไข</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs text-slate-500">sys005</TableCell>
                <TableCell className="font-semibold text-slate-900">ระบบงานพัสดุและสินทรัพย์</TableCell>
                <TableCell>งานทั่วไป</TableCell>
                <TableCell>ภายใน</TableCell>
                <TableCell><Badge variant="danger" dot>ปิดปรับปรุง</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">แก้ไข</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={5}
            totalItems={48}
            pageSize={10}
            onPageChange={setCurrentPage}
          />
        </section>

        {/* Section 6: Dialogs & Modals */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-700" />
            <span>6. หน้าต่างแจ้งเตือนและยืนยัน (Modals & Dialogs)</span>
          </h2>

          <Card>
            <CardContent className="p-6 flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                เปิดตัวอย่าง Standard Modal
              </Button>
              <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                เปิดตัวอย่าง Confirm Dialog (ยืนยันลบ)
              </Button>
            </CardContent>
          </Card>

          {/* Standard Modal Sample */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="เพิ่มทะเบียนระบบใหม่"
            description="กรอกข้อมูลเพื่อลงทะเบียนระบบงานเข้าสู่สารบบพอร์ทัลกลาง"
            footer={
              <>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  ยกเลิก
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  บันทึกข้อมูล
                </Button>
              </>
            }
          >
            <div className="space-y-4 py-2">
              <Input label="ชื่อระบบทางการ" placeholder="เช่น ระบบงานพยาบาล" />
              <Select
                label="หมวดหมู่งาน"
                options={[
                  { value: "general", label: "งานทั่วไป" },
                  { value: "student", label: "งานนักเรียน" },
                ]}
              />
            </div>
          </Modal>

          {/* Confirm Dialog Sample */}
          <ConfirmDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={() => setIsConfirmOpen(false)}
            title="ยืนยันการระงับสิทธิ์การใช้งาน"
            message="คุณแน่ใจหรือไม่ว่าต้องการระงับสิทธิ์การเข้าถึงระบบนี้? ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะเปิดใช้งานอีกครั้ง"
            variant="danger"
            confirmLabel="ยืนยันระงับสิทธิ์"
          />
        </section>

        {/* Section 7: Loading Skeletons & Empty State */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-700" />
            <span>7. สถานะโหลดและสถานะว่าง (Loading & Empty States)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">โครงสร้างตอนกำลังโหลด (Card Skeleton)</p>
              <CardSkeleton />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">สถานะไม่พบข้อมูล (Empty State)</p>
              <EmptyState
                title="ไม่พบรายการระบบงาน"
                description="ยังไม่มีระบบงานที่ตรงกับคำค้นหาของคุณ กรุณาลองเปลี่ยนคำค้นหาใหม่อีกครั้ง"
                action={
                  <Button variant="outline" size="sm">
                    ล้างการค้นหา
                  </Button>
                }
              />
            </div>
          </div>
        </section>
      </div>
  );
}
