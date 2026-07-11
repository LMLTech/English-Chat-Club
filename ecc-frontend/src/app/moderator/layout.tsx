"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { motion } from "framer-motion";
import { cn, staggerContainer, slideIn } from "@/lib/utils";
import { 
  LayoutDashboard, Video, CalendarDays, 
  Star, ArrowLeft, LogOut, User
} from "lucide-react";
import { authService } from "@/features/auth/authService";
import { toast } from "sonner";

const moderatorNavItems = [
  { label: "Tổng quan", href: "/moderator/dashboard", icon: LayoutDashboard },
  { label: "Quản lý phòng", href: "/moderator/rooms", icon: Video },
  { label: "Lịch sử dạy", href: "/moderator/history", icon: CalendarDays },
  { label: "Đánh giá", href: "/moderator/reviews", icon: Star },
  { label: "Hồ sơ cá nhân", href: "/moderator/profile", icon: User },
];

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const { user, clearTokens, refreshToken } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const isAllowed = ['MODERATOR', 'ROLE_MODERATOR', 'ADMIN', 'ROLE_ADMIN'].includes(user?.role || '');
    if (!user || !isAllowed) {
      router.push("/dashboard");
    } else {
      setIsAuthorized(true);
    }
  }, [user, mounted, router]);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {} 
    finally {
      clearTokens();
      toast.success("Đã đăng xuất");
      router.push("/login");
    }
  };

  if (!mounted || !isAuthorized) {
    return <LoadingSpinner size="lg" text="Đang xác thực quyền Moderator..." />;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden relative">
      {/* Animated Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>
      
      {/* Content wrapper */}
      <div className="z-10 flex h-full w-full">
      {/* Moderator Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#12141c] border-r border-white/5 flex flex-col h-full z-20">
        <div className="px-5 py-5 border-b border-white/5">
          <Link href="/moderator/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Video className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Moderator Panel</p>
              <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mt-1">ECC System</p>
            </div>
          </Link>
        </div>

        <motion.nav 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
        >
          <p className="px-3 pb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Quản lý lớp học</p>
          {moderatorNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <motion.div key={item.href} variants={slideIn}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    active 
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                      : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", active ? "text-amber-400" : "")} />
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-100px] left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px]" 
          />
        </div>
        
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 z-10">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {moderatorNavItems.find(i => i.href === pathname)?.label || "Bảng điều khiển"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Online
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              MOD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 z-10 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
