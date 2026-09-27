import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary:
        "bg-green-700 hover:bg-green-800 active:bg-green-900 text-white shadow-sm focus-visible:ring-green-600 focus-visible:ring-offset-white disabled:bg-slate-300 disabled:text-slate-500",
      secondary:
        "bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200/80 focus-visible:ring-slate-500 focus-visible:ring-offset-white disabled:bg-slate-50 disabled:text-slate-400",
      outline:
        "bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm focus-visible:ring-green-600 focus-visible:ring-offset-white disabled:border-slate-200 disabled:text-slate-400",
      ghost:
        "hover:bg-slate-100 active:bg-slate-200 text-slate-700 focus-visible:ring-slate-500 disabled:text-slate-400",
      danger:
        "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus-visible:ring-rose-600 focus-visible:ring-offset-white disabled:bg-slate-300 disabled:text-slate-500",
      success:
        "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm focus-visible:ring-emerald-600 focus-visible:ring-offset-white disabled:bg-slate-300 disabled:text-slate-500",
    };

    const sizeStyles = {
      sm: "text-sm px-3 py-1.5 gap-1.5",
      md: "text-base px-4 py-2.5 gap-2",
      lg: "text-base sm:text-lg px-6 py-3 gap-2.5",
      icon: "h-10 w-10 p-2",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>กำลังประมวลผล...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
