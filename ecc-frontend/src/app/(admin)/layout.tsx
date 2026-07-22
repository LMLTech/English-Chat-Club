"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { motion } from "framer-motion";
import { cn, staggerContainer, slideIn } from "@/lib/utils";
import { 
  LayoutDashboard, Users, BookOpen, CalendarDays, 
  ShieldCheck, ArrowLeft, LogOut, Mail, MessageSquare, Library, Gift, BarChart
} from "lucide-react";
import { authService } from "@/features/auth/authService";
import { toast } from "sonner";

const adminNavItems = [
  { label: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Cộng đồng & Diễn đàn", href: "/admin/forum", icon: MessageSquare },
  { label: "Cửa hàng quà tặng", href: "/admin/rewards", icon: Gift },
  { label: "Báo cáo thống kê", href: "/admin/reports", icon: BarChart },
  { label: "Sự kiện", href: "/admin/events", icon: CalendarDays },
  { label: "Duyệt Session", href: "/admin/sessions", icon: ShieldCheck },
  { label: "Tài nguyên", href: "/admin/resources", icon: Library },
  { label: "Marketing", href: "/admin/marketing", icon: Mail },
  { label: "Hỗ trợ", href: "/admin/support", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, clearTokens, refreshToken } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sparks state for background animation
  const [sparks, setSparks] = useState<Array<{id: number, left: string, size: number, delay: string, duration: string}>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate sparks (Red/Rose)
    const newSparks = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 2,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 6 + 4}s`
    }));
    setSparks(newSparks);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user || (user.role !== "ADMIN" && user.role !== "ROLE_ADMIN")) {
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
    return <LoadingSpinner size="lg" text="Đang xác thực quyền Admin..." />;
  }

  return (
    <div className="flex h-screen bg-[#05050A] overflow-hidden relative font-sans text-slate-200">
      
      {/* Global Animations & Effects */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes spark-rise {
          0% { transform: translateY(100vh) translateX(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-20vh) translateX(50px) scale(0); opacity: 0; }
        }
        @keyframes float-img {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-blob-spin { animation: blob-spin 25s linear infinite; }
        .animate-float-img { animation: float-img 6s ease-in-out infinite; }
        .glass-panel { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
      `}} />

      {/* Deep Animated Mesh Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
        {/* Giant glowing orbs for gradient mesh effect - Red/Rose/Purple */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-900/30 blur-[120px] animate-blob-spin"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[120px] animate-blob-spin" style={{animationDelay: '7s'}}></div>
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-fuchsia-900/10 blur-[100px] animate-blob-spin" style={{animationDelay: '14s'}}></div>
        
        {/* Fire Sparks (Red Embers) */}
        {sparks.map(spark => (
          <div 
            key={spark.id}
            className="absolute bottom-0 rounded-full bg-gradient-to-t from-red-600 via-rose-500 to-pink-300"
            style={{
              left: spark.left,
              width: spark.size,
              height: spark.size * 2,
              opacity: 0,
              filter: 'blur(1px)',
              boxShadow: '0 0 10px 2px rgba(225, 29, 72, 0.6)',
              animation: `spark-rise ${spark.duration} ease-in ${spark.delay} infinite`
            }}
          />
        ))}
      </div>
      
      {/* Content wrapper */}
      <div className="z-10 flex h-full w-full">
        {/* Admin Sidebar */}
        <aside className="w-64 flex-shrink-0 glass-panel border-r border-white/10 flex flex-col h-full z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
          <div className="px-5 py-5 border-b border-white/10 bg-black/20">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.3)] group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Admin Panel</p>
                <p className="text-[10px] uppercase tracking-wider text-red-400 font-bold mt-1">ECC System</p>
              </div>
            </Link>
          </div>

          <motion.nav 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
          >
            <p className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quản lý hệ thống</p>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <motion.div key={item.href} variants={slideIn}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group mx-1",
                      active 
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(225,29,72,0.1)]" 
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", active ? "text-red-400" : "")} />
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>

          <div className="p-4 border-t border-white/10 bg-black/20 space-y-2">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
          
          {/* Header */}
          <header className="h-20 border-b border-white/10 glass-panel flex items-center justify-between px-8 z-30 shadow-[0_5px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
              {adminNavItems.find(i => i.href === pathname)?.label || "Bảng điều khiển"}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                System Online
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xs shadow-[0_0_15px_rgba(225,29,72,0.2)]">
                AD
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 z-10 relative scroll-smooth">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
