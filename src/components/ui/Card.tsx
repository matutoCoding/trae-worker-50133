import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export default function Card({ title, subtitle, footer, className, children }: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-secondary border border-border-color rounded-xl transition-all duration-300 hover:shadow-glow-primary hover:border-accent-primary/30",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-border-color">
          {title && <div className="text-text-primary font-semibold text-base">{title}</div>}
          {subtitle && <div className="text-text-secondary text-sm mt-1">{subtitle}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-border-color text-text-secondary text-sm">
          {footer}
        </div>
      )}
    </div>
  );
}
