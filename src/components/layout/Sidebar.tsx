import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Activity,
  TrendingUp,
  AlertTriangle,
  Siren,
  Settings,
  FileText,
  Radiation,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const menuItems: MenuItem[] = [
  { to: "/", icon: LayoutDashboard, label: "系统概览" },
  { to: "/monitoring-points", icon: MapPin, label: "监测点位" },
  { to: "/realtime-data", icon: Activity, label: "实时数据" },
  { to: "/dose-trend", icon: TrendingUp, label: "剂量趋势" },
  { to: "/alerts", icon: AlertTriangle, label: "异常预警" },
  { to: "/emergency", icon: Siren, label: "应急处置" },
  { to: "/calibration", icon: Settings, label: "设备校准" },
  { to: "/reports", icon: FileText, label: "报告生成" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 h-screen bg-bg-secondary border-r border-border-color flex flex-col fixed left-0 top-0 z-30">
      <div className="h-16 flex items-center px-5 border-b border-border-color">
        <Radiation className="w-7 h-7 text-accent-primary mr-3 animate-pulse-slow" />
        <span className="text-text-primary font-semibold text-lg tracking-wide">
          核辐射环境监测系统
        </span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
                      isActive
                        ? "bg-accent-primary/15 text-accent-primary shadow-glow-primary border border-accent-primary/30"
                        : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border-color p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center border border-accent-primary/40">
            <span className="text-accent-primary font-semibold text-sm">管</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-text-primary text-sm font-medium truncate">管理员</div>
            <div className="text-text-muted text-xs truncate">系统管理员</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
