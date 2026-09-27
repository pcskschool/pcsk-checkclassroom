import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, required, id, rows = 4, disabled, ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-base font-medium text-slate-800 mb-1.5">
            {label}
            {required && <span className="text-rose-600 ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full py-2.5 px-3.5 bg-white border rounded-lg text-base text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600",
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            error
              ? "border-rose-400 focus:border-rose-600 focus:ring-rose-600/20 text-rose-900"
              : "border-slate-300",
            className
          )}
          {...props}
        />

        {error ? (
          <p role="alert" className="mt-1.5 text-sm text-rose-600 flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
