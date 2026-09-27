import React from "react";
import { cn } from "@/lib/utils";
import { Megaphone, AlertCircle, Info, X } from "lucide-react";

export interface AnnouncementBannerProps {
  title?: string;
  content: string;
  type?: "info" | "warning" | "urgent";
  className?: string;
  onDismiss?: () => void;
}

/**
 * Shared System Announcement Banner Component.
 * Placed consistently above system page content according to Section 22.
 */
export function AnnouncementBanner({
  title = "ประกาศ",
  content,
  type = "info",
  className,
  onDismiss,
}: AnnouncementBannerProps) {
  const typeStyles = {
    info: {
      border: "border-green-200 bg-green-50/70 text-green-900",
      iconBg: "bg-green-100 text-green-700",
      titleColor: "text-green-950",
      icon: <Megaphone className="w-5 h-5" />,
    },
    warning: {
      border: "border-amber-200 bg-amber-50/70 text-amber-900",
      iconBg: "bg-amber-100 text-amber-700",
      titleColor: "text-amber-950",
      icon: <Info className="w-5 h-5" />,
    },
    urgent: {
      border: "border-rose-200 bg-rose-50/70 text-rose-900",
      iconBg: "bg-rose-100 text-rose-700",
      titleColor: "text-rose-950",
      icon: <AlertCircle className="w-5 h-5" />,
    },
  };

  const style = typeStyles[type];

  return (
    <div
      role="region"
      aria-label="ประกาศประจำระบบ"
      className={cn(
        "rounded-xl border p-4 sm:p-5 flex items-start gap-3.5 mb-6 shadow-2xs transition-all",
        style.border,
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-2xs",
          style.iconBg
        )}
      >
        {style.icon}
      </div>

      <div className="flex-1">
        <h4 className={cn("text-base font-bold flex items-center gap-1.5", style.titleColor)}>
          <span>{title}</span>
        </h4>
        <p className="text-base text-slate-700 mt-0.5 leading-relaxed">
          {content}
        </p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="ปิดการประกาศ"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
