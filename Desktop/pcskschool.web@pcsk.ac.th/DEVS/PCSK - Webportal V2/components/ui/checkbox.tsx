import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, disabled, checked, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-6">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className={cn(
              "w-5 h-5 rounded border border-slate-300 text-green-700 bg-white shadow-sm cursor-pointer",
              "focus:ring-2 focus:ring-green-600 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-200",
              error && "border-rose-400 focus:ring-rose-500",
              className
            )}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className="text-base leading-6">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "font-medium text-slate-800 select-none cursor-pointer",
                  disabled && "text-slate-400 cursor-not-allowed"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            )}
            {error && (
              <p className="text-sm text-rose-600 mt-0.5">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
