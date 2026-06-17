import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  User,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  };

  return (
    <header className="h-16 bg-bg-secondary border-b border-border-color flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-20">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-text-primary text-lg font-semibold">系统概览</h1>
          <div className="flex items-center gap-1 text-text-muted text-xs">
            <span>首页</span>
            <span>/</span>
            <span className="text-text-secondary">系统概览</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索监测点位、设备编号、预警信息..."
            className="w-full h-9 pl-10 pr-4 bg-bg-tertiary border border-border-color rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:shadow-glow-primary transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-text-secondary font-mono text-sm mr-2 px-3 py-1.5 bg-bg-tertiary rounded-md border border-border-color">
          {formatTime(currentTime)}
        </div>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-bg-tertiary border border-border-color text-text-secondary hover:text-text-primary hover:border-accent-primary/50 transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-danger text-white text-xs flex items-center justify-center font-medium">
            5
          </span>
        </button>

        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-bg-tertiary border border-border-color text-text-secondary hover:text-text-primary hover:border-accent-primary/50 transition-all duration-200">
          <MessageSquare className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border-color hover:border-accent-primary/50 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-full bg-accent-primary/20 flex items-center justify-center border border-accent-primary/40">
              <span className="text-accent-primary font-semibold text-xs">管</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-text-secondary transition-transform duration-200", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary border border-border-color rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border-color">
                <div className="text-text-primary text-sm font-medium">管理员</div>
                <div className="text-text-muted text-xs">admin@example.com</div>
              </div>
              <ul className="py-1">
                <li>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors">
                    <User className="w-4 h-4" />
                    个人中心
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors">
                    <SettingsIcon className="w-4 h-4" />
                    系统设置
                  </button>
                </li>
                <li className="border-t border-border-color">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-accent-danger hover:bg-accent-danger/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
