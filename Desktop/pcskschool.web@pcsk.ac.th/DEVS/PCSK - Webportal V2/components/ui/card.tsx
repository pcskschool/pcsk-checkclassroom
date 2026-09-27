import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-sm text-slate-800 transition-all",
        hoverable && "hover:shadow-md hover:border-slate-300 transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  bordered = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { bordered?: boolean }) {
  return (
    <div
      className={cn(
        "p-6",
        bordered && "border-b border-slate-100 pb-4",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  as: Component = "h3",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" | "h4" }) {
  return (
    <Component
      className={cn("text-lg sm:text-xl font-bold text-slate-900 leading-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm sm:text-base text-slate-500 mt-1 leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  bordered = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { bordered?: boolean }) {
  return (
    <div
      className={cn(
        "p-6 pt-0 flex items-center gap-3",
        bordered && "border-t border-slate-100 pt-4 mt-4 bg-slate-50/50 rounded-b-xl",
        className
      )}
      {...props}
    />
  );
}
