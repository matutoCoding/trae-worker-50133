import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children?: ReactNode;
}

function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-secondary border border-border-color rounded-xl transition-all duration-300 hover:shadow-glow-primary hover:border-accent-primary/30",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children?: ReactNode;
}

function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn("px-5 py-4 border-b border-border-color", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children?: ReactNode;
}

function CardTitle({ className, children }: CardTitleProps) {
  return (
    <div className={cn("text-text-primary font-semibold text-base", className)}>
      {children}
    </div>
  );
}

interface CardDescriptionProps {
  className?: string;
  children?: ReactNode;
}

function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <div className={cn("text-text-secondary text-sm mt-1", className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  className?: string;
  children?: ReactNode;
}

function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn("p-5", className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  className?: string;
  children?: ReactNode;
}

function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn("px-5 py-4 border-t border-border-color text-text-secondary text-sm", className)}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
