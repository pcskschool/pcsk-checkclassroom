import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Spinner({
  size = "md",
  text,
  className,
  ...props
}: SpinnerProps) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  return (
    <div
      role="status"
      className={cn("flex flex-col items-center justify-center gap-3 text-green-700", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin", sizeMap[size])} />
      {text && <span className="text-sm font-medium text-slate-600">{text}</span>}
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

/**
 * Full page loading overlay for global asynchronous transitions
 */
export function FullPageLoading({ text = "กำลังโหลดข้อมูล..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-xs">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
        <p className="text-base font-medium text-slate-800">{text}</p>
      </div>
    </div>
  );
}
