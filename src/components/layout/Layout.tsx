import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <Header />
      <main className={cn("ml-60 pt-16 min-h-screen", className)}>
        <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
