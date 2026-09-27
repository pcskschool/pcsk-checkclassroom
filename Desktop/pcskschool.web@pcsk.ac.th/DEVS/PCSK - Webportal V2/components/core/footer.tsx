import React from "react";
import { PORTAL_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface FooterProps {
  footerText?: string;
  className?: string;
}

export function Footer({ footerText, className }: FooterProps) {
  const text = footerText || PORTAL_CONFIG.footerText;

  return (
    <footer className={cn("bg-white border-t border-slate-200 py-5 mt-auto", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-sm text-slate-500">
          {text}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>ระบบพอร์ทัลกลางสถานศึกษา</span>
          <span>•</span>
          <span className="text-green-700 font-medium">เวอร์ชัน {PORTAL_CONFIG.version}</span>
        </div>
      </div>
    </footer>
  );
}
