import React from "react";
import { cn } from "@/lib/utils";
import { FolderSearch } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "py-12 px-6 rounded-2xl border border-dashed border-slate-300 bg-white text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-2xs",
        className
      )}
      {...props}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mb-4 shadow-2xs">
        {icon || <FolderSearch className="w-7 h-7 text-slate-400" />}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>

      {description && (
        <p className="text-base text-slate-500 max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
