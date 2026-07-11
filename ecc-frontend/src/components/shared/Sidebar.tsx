"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/features/auth/authService";
import { toast } from "sonner";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  MessageSquare,
  Users,
  Trophy,
  Library,
  User,
  LogOut,
  Sparkles,
  Swords,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Buổi học", href: "/sessions", icon: CalendarDays },
  { label: "Diễn đàn", href: "/forum", icon: MessageSquare },
  { label: "Bạn bè", href: "/friends", icon: Users },
  { label: "Tin nhắn", href: "/messages", icon: BookOpen },
  { label: "Bảng xếp hạng", href: "/leaderboard", icon: Trophy },
  { label: "Tài nguyên", href: "/resources", icon: Library },
  { label: "Điểm & Huy hiệu", href: "/gamification", icon: Swords },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearTokens, refreshToken, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors
    } finally {
      clearTokens();
      toast.success("Đã đăng xuất thành công");
      router.push("/login");
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 flex-shrink-0 glass-card border-r border-white/5 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center animate-pulse-glow flex-shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gradient leading-none">English Chat</p>
            <p className="text-xs text-muted-foreground">Club</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
          Menu chính
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${active ? "active" : ""}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3 space-y-1">
        <Link
          href="/profile"
          className={`sidebar-item ${pathname === "/profile" ? "active" : ""}`}
        >
          <User className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.fullName || "Hồ sơ"}
            </p>
            {user?.role && (
              <p className="text-xs text-muted-foreground">{user.role}</p>
            )}
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left hover:text-red-400 hover:bg-red-500/5"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
