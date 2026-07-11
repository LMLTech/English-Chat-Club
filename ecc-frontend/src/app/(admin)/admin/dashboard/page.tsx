"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, CalendarDays, ShieldCheck, Activity, TrendingUp } from "lucide-react";
import { staggerContainer, scaleUp } from "@/lib/utils";

const stats = [
  { title: "Tổng người dùng", value: "1,234", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
  { title: "Topics đang active", value: "45", icon: BookOpen, color: "text-violet-400", bg: "bg-violet-500/10" },
  { title: "Session chờ duyệt", value: "12", icon: ShieldCheck, color: "text-amber-400", bg: "bg-amber-500/10" },
  { title: "Sự kiện sắp tới", value: "3", icon: CalendarDays, color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-red-400" />
          Tổng quan hệ thống
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Hệ thống hoạt động ổn định
        </div>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i} 
              variants={scaleUp}
              className="glass-card p-6 rounded-2xl border border-white/5 flex items-start gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} border border-current/20`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Animated Chart Section */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-lg font-bold text-white">Lưu lượng truy cập hệ thống</h2>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-red-500/50">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          
          {/* Fake SVG Chart Animation */}
          <div className="h-48 relative w-full flex items-end justify-between px-2 z-10">
            {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
              <div key={i} className="w-[10%] group-hover:bg-white/5 rounded-t-lg transition-colors flex items-end justify-center h-full relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                  className="w-full bg-gradient-to-t from-red-600/20 to-orange-500 rounded-t-lg shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                />
                <div className="absolute -bottom-6 text-[10px] text-muted-foreground font-mono">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}
                </div>
              </div>
            ))}
          </div>
          
          {/* Background Grid Lines */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
        </div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl border border-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent hover:from-blue-500/20 border border-blue-500/20 transition-all text-sm text-blue-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <Users className="w-4 h-4 text-blue-400" />
                Quản lý phân quyền Role
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent hover:from-amber-500/20 border border-amber-500/20 transition-all text-sm text-amber-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Duyệt yêu cầu mở Session
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-transparent hover:from-violet-500/20 border border-violet-500/20 transition-all text-sm text-violet-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-violet-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <BookOpen className="w-4 h-4 text-violet-400" />
                Thêm chủ đề học mới
              </button>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl border border-white/5 p-6">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Mới đây</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">Hệ thống database đã backup.</p>
                  <p className="text-[10px] text-muted-foreground">Vài giây trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
