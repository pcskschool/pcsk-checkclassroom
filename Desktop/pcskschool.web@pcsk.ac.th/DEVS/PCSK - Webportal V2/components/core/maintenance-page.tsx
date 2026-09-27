import React from "react";
import Link from "next/link";
import { Wrench, ArrowLeft, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MaintenancePageProps {
  systemTitle?: string;
  explanation?: string | null;
  schedule?: string | null;
  returnUrl?: string;
}

/**
 * Shared Portal Core Maintenance Page Component.
 * Rendered when an individual system or the global portal is marked under maintenance (Section 20).
 */
export function MaintenancePage({
  systemTitle,
  explanation = "ระบบนี้กำลังปิดให้บริการชั่วคราวเพื่อดำเนินการปรับปรุงระบบ กรุณากลับมาใช้งานอีกครั้งในภายหลัง",
  schedule,
  returnUrl = "/dashboard",
}: MaintenancePageProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-md p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Top Warning Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500" />

        {/* Maintenance Visual */}
        <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Wrench className="w-10 h-10 animate-bounce duration-1000" />
        </div>

        {/* Badge Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>โหมดปิดปรับปรุงระบบ (Maintenance Mode)</span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
          ระบบอยู่ระหว่างปรับปรุง
        </h1>

        {/* Specific System Title if applicable */}
        {systemTitle && (
          <p className="text-lg font-semibold text-green-800 mb-3">
            {systemTitle}
          </p>
        )}

        {/* Explanation Message */}
        <p className="text-base text-slate-600 leading-relaxed mb-6">
          {explanation}
        </p>

        {/* Optional Maintenance Schedule */}
        {schedule && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 flex items-center justify-center gap-2 mb-8">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>กำหนดการแล้วเสร็จ: <strong>{schedule}</strong></span>
          </div>
        )}

        {/* Action: Return to Dashboard */}
        <div className="pt-2">
          <Link href={returnUrl}>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<ArrowLeft className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              กลับสู่แผงควบคุมหลัก (Dashboard)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
