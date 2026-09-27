"use client";

import React from "react";
import { AlertTriangle, Clock, RefreshCw, LogOut } from "lucide-react";

interface InactivityModalProps {
  isOpen: boolean;
  formattedCountdown: string;
  onExtend: () => void;
  onSignOut: () => void;
}

export function InactivityModal({
  isOpen,
  formattedCountdown,
  onExtend,
  onSignOut,
}: InactivityModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />

        {/* Warning Icon Container */}
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Modal Title */}
        <h3
          id="inactivity-modal-title"
          className="text-xl font-bold text-slate-900 mb-2"
        >
          เซสชันใกล้หมดอายุเนื่องจากไม่มีการใช้งาน
        </h3>

        {/* Explanation */}
        <p className="text-base text-slate-600 leading-relaxed mb-6">
          คุณไม่ได้เคลื่อนไหวหรือทำรายการในระบบเป็นระยะเวลาหนึ่ง 
          เพื่อความปลอดภัยของข้อมูล ระบบจะลงชื่อออกอัตโนมัติภายใน
        </p>

        {/* Countdown Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-2xl font-bold mb-8 tracking-wider">
          <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
          <span>{formattedCountdown}</span>
          <span className="text-sm font-sans font-normal text-amber-700">นาที</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onExtend}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-white bg-green-700 hover:bg-green-800 active:bg-green-900 font-medium text-base transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>ขยายเวลาการใช้งาน</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 font-medium text-base transition-colors focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
