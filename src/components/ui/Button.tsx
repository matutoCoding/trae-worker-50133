import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "default" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-primary text-white hover:bg-accent-primary/90 hover:shadow-glow-primary border border-accent-primary",
  secondary:
    "bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80 border border-border-color",
  success:
    "bg-accent-success text-white hover:bg-accent-success/90 hover:shadow-glow-success border border-accent-success",
  warning:
    "bg-accent-warning text-bg-primary hover:bg-accent-warning/90 hover:shadow-glow-warning border border-accent-warning",
  danger:
    "bg-accent-danger text-white hover:bg-accent-danger/90 hover:shadow-glow-danger border border-accent-danger",
  default:
    "bg-bg-secondary text-text-primary hover:bg-bg-tertiary border border-border-color",
  ghost:
    "bg-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border border-border-color",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
