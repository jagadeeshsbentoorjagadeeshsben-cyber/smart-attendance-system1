import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "secondary";
  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-royal text-white hover:bg-royal/90 shadow-sm",
      secondary: "bg-surface-2 text-ink hover:bg-surface border border-border shadow-sm",
      outline: "border border-border bg-surface hover:bg-surface-2 text-ink",
      ghost: "hover:bg-surface-2 text-muted hover:text-ink",
      danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-xs",
      sm: "h-7 px-3 text-[11px]",
      lg: "h-11 px-6 text-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
