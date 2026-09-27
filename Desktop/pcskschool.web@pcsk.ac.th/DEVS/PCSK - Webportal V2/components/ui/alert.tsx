import React from "react";
import { cn } from "@/lib/utils";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  onDismiss?: () => void;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  onDismiss,
  ...props
}: AlertProps) {
  const variantConfig = {
    info: {
      container: "bg-sky-50 border-sky-200 text-sky-900",
      icon: <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />,
      titleColor: "text-sky-950",
    },
    success: {
      container: "bg-green-50 border-green-200 text-green-900",
      icon: <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />,
      titleColor: "text-green-950",
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />,
      titleColor: "text-amber-950",
    },
    danger: {
      container: "bg-rose-50 border-rose-200 text-rose-900",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />,
      titleColor: "text-rose-950",
    },
  };

  const current = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn(
        "p-4 rounded-xl border flex items-start gap-3 relative shadow-2xs",
        current.container,
        className
      )}
      {...props}
    >
      {current.icon}

      <div className="flex-1 text-sm sm:text-base leading-relaxed">
        {title && (
          <h4 className={cn("font-semibold mb-0.5", current.titleColor)}>
            {title}
          </h4>
        )}
        <div className="text-current opacity-90">{children}</div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="ปิดการแจ้งเตือน"
          className="text-current opacity-60 hover:opacity-100 p-1 rounded-md transition-opacity -mr-1 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
