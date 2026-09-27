import { Suspense } from "react";
import Link from "next/link";
import { School, Megaphone, ShieldCheck, ArrowLeft, Info, AlertTriangle } from "lucide-react";
import { LoginForm } from "@/components/core/login-form";
import { getActiveAnnouncements, getPortalSettings } from "@/lib/services/portal-data";
import { PORTAL_CONFIG } from "@/lib/constants";

export const metadata = {
  title: "เข้าสู่ระบบ",
  description: "ระบบลงชื่อเข้าใช้งานเว็บพอร์ทัลกลาง โรงเรียนพิจิตรคริสเตียน (PCSK School)",
};

export default async function LoginPage() {
  const [settings, announcements] = await Promise.all([
    getPortalSettings(),
    getActiveAnnouncements(),
  ]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      {/* Top Simple Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-3 text-slate-900 hover:text-green-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center text-white shadow-sm">
              <School className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold block leading-tight">
                {settings.portal_name || PORTAL_CONFIG.name}
              </span>
              <span className="text-xs text-slate-500 block">
                {settings.school_name || PORTAL_CONFIG.schoolFullName}
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าแรก</span>
          </Link>
        </div>
      </header>

      {/* Main Login Layout Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
          
          {/* Left Column: School Information & Admin Announcements */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs font-medium mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
                ระบบสารสนเทศความมั่นคงปลอดภัยสูง
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                ลงชื่อเข้าสู่ระบบ
              </h1>
              <p className="text-base text-slate-600 leading-relaxed">
                เข้าสู่พอร์ทัลกลางเพื่อใช้งานระบบบริหารจัดการ ระบบวิชาการ และงานสารสนเทศทั้งหมดของโรงเรียน
              </p>
            </div>

            {/* Administrator Announcements Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-base border-b border-slate-100 pb-3">
                <Megaphone className="w-4 h-4 text-green-700" />
                <span>ประกาศและข่าวสารจากผู้ดูแลระบบ</span>
              </div>

              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div 
                      key={ann.id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-sm space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        {ann.announcement_type === "warning" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-green-700 flex-shrink-0" />
                        )}
                        <span className="font-semibold text-slate-900">{ann.title}</span>
                      </div>
                      <p className="text-slate-600 pl-6 leading-relaxed">
                        {ann.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-2">
                  ไม่มีประกาศสำคัญในขณะนี้ ระบบเปิดให้บริการตามปกติ
                </p>
              )}
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p>• หากลืมรหัสผ่านหรือต้องการเปิดสิทธิ์การใช้งาน กรุณาติดต่อฝ่ายเทคโนโลยีสารสนเทศ</p>
              <p>• ระบบจะตัดการเชื่อมต่ออัตโนมัติเมื่อไม่มีการเคลื่อนไหวเกิน {settings.inactivity_timeout_minutes} นาที</p>
            </div>
          </div>

          {/* Right Column: Login Form Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              เข้าใช้งานด้วยบัญชีโรงเรียน
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              ใช้อีเมลทางการของสถานศึกษา (@pcsk.ac.th)
            </p>

            <Suspense fallback={
              <div className="py-12 text-center text-slate-400 text-sm">
                กำลังเตรียมข้อมูลแบบฟอร์ม...
              </div>
            }>
              <LoginForm />
            </Suspense>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>{settings.footer_text || PORTAL_CONFIG.footerText}</p>
        </div>
      </footer>
    </div>
  );
}
