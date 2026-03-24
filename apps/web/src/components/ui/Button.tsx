import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "dark";
export type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-accent text-accent-foreground",
    "active:bg-accent-hover",
    "disabled:bg-accent-muted disabled:text-accent-foreground/60",
  ),
  secondary: cn(
    "bg-surface border border-line text-fg-primary",
    "active:bg-background-secondary",
    "disabled:bg-surface-secondary disabled:text-fg-muted disabled:border-line",
  ),
  danger: cn(
    "bg-error-600 text-white",
    "active:bg-error-700",
    "disabled:bg-error-500/50 disabled:text-white/60",
  ),
  ghost: cn(
    "bg-transparent text-fg-secondary",
    "active:bg-background-secondary",
    "disabled:text-fg-muted",
  ),
  dark: cn(
    "bg-fg-primary text-fg-inverse",
    "active:bg-fg-secondary",
    "disabled:bg-fg-muted disabled:text-fg-inverse/60",
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "min-h-12 px-6 py-3 text-base",
  lg: "min-h-14 px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-xl font-medium",
        "transition-all duration-150",
        "active:scale-[0.98]",
        "disabled:pointer-events-none",
        "select-none touch-manipulation",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
