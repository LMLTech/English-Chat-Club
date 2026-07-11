"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/features/auth/authService";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { staggerContainer, slideIn, cn } from "@/lib/utils";
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
  Gift,
  LifeBuoy,
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
  { label: "Điểm & Huy hiệu", href: "/gamification", icon: Swords },
  { label: "Đổi quà", href: "/rewards", icon: Gift },
  { label: "Tài nguyên", href: "/resources", icon: Library },
  { label: "Hỗ trợ", href: "/support", icon: LifeBuoy },
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
    <aside className="w-64 flex-shrink-0 glass-card border-r border-white/5 flex flex-col h-full bg-background/50 backdrop-blur-xl">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center animate-pulse-glow flex-shrink-0"
          >
            <Sparkles className="w-[18px] h-[18px] text-white" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-gradient leading-none group-hover:opacity-80 transition-opacity">English Chat</p>
            <p className="text-xs text-muted-foreground">Club</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <motion.nav 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
      >
        <p className="px-3 pb-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
          Menu chính
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <motion.div key={item.href} variants={slideIn}>
              <Link
                href={item.href}
                className={cn(
                  "sidebar-item relative overflow-hidden group",
                  active ? "active text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110", active ? "text-violet-400" : "")} />
                <span className="font-medium text-[13px]">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3 space-y-1 bg-white/[0.02]">
        <Link
          href="/profile"
          className={cn(
            "sidebar-item hover:bg-white/10 transition-colors",
            pathname === "/profile" ? "active bg-white/10" : ""
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/80 to-blue-500/80 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.fullName || "Hồ sơ"}
            </p>
            {user?.role && (
              <p className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">{user.role.replace('ROLE_', '')}</p>
            )}
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium text-[13px]">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
