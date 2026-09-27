import Link from "next/link";
import { PORTAL_CONFIG, DEFAULT_SYSTEM_GROUPS } from "@/lib/constants";
import { 
  Building2, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Palette, 
  ArrowRight,
  School
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      {/* Top Header / Brand Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center text-white shadow-sm">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                {PORTAL_CONFIG.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {PORTAL_CONFIG.schoolFullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-medium rounded-lg text-white bg-green-700 hover:bg-green-800 active:bg-green-900 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
            >
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 mb-8 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
            สถาปัตยกรรมระบบเวอร์ชัน 2.0 (Phase 1 Baseline Ready)
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
            ศูนย์กลางระบบสารสนเทศและการบริหารจัดการ
          </h2>
          <p className="text-base text-slate-600 max-w-3xl leading-relaxed mb-6">
            เว็บพอร์ทัลกลางที่รวบรวมระบบงานย่อยทั้งหมดของโรงเรียนไว้ในจุดเดียว 
            ออกแบบตามมาตรฐานความปลอดภัยระดับสูง การแยกชั้นสถาปัตยกรรมอย่างเป็นระบบ 
            และระบบการออกแบบ (Design System) ที่เป็นเอกภาพ
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white bg-green-700 hover:bg-green-800 font-medium text-base transition-colors shadow-sm"
            >
              <span>ไปที่หน้าลงชื่อเข้าใช้งาน</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Architectural Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Portal Core & Modules</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              แยกชั้นระบบโครงข่ายหลักออกจากโมดูลงานเฉพาะด้านอย่างเด็ดขาด ป้องกันการเกิดความซ้ำซ้อน
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Supabase Auth & RLS</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              การรักษาความปลอดภัยระดับฐานข้อมูลด้วย Row Level Security พร้อมการตรวจสอบสิทธิ์แบบ Server-Side
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <Palette className="w-5 h-5 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Strict Design System</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ควบคุมโทนสี Slate/Zinc และ Green Accent โดยไม่มี Design Drift ขนาดตัวอักษรเนื้อหาไม่ต่ำกว่า 16px
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Inactivity Timeout</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ระบบตรวจสอบกิจกรรมผู้ใช้เพื่อตัดการเชื่อมต่ออัตโนมัติเมื่อไม่มีการใช้งาน (ค่าเริ่มต้น 30 นาที)
            </p>
          </div>
        </div>

        {/* Standard System Groups Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-green-700" />
            <h3 className="text-lg font-semibold text-slate-900">
              หมวดหมู่ระบบงานตามทะเบียนกลาง (System Groups)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SYSTEM_GROUPS.map((group) => (
              <span
                key={group}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-sm font-medium"
              >
                {group}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Standard Portal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-sm text-slate-500 font-normal">
            {PORTAL_CONFIG.footerText}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>เวอร์ชันระบบ {PORTAL_CONFIG.version}</span>
            <span>•</span>
            <span className="text-green-700 font-medium">สถานะระบบปกติ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
