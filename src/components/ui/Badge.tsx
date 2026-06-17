import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "notice" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-accent-primary/15 text-accent-primary border-accent-primary/30",
  secondary: "bg-bg-tertiary text-text-primary border-border-color",
  success: "bg-accent-success/15 text-accent-success border-accent-success/30",
  warning: "bg-accent-warning/15 text-accent-warning border-accent-warning/30",
  danger: "bg-accent-danger/15 text-accent-danger border-accent-danger/30",
  notice: "bg-accent-notice/15 text-accent-notice border-accent-notice/30",
  default: "bg-bg-tertiary text-text-secondary border-border-color",
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
