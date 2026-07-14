"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, CalendarDays, ShieldCheck, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { staggerContainer, scaleUp } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { adminService } from "@/features/admin/adminService";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(data => setStatsData(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { title: "Tổng người dùng", value: statsData?.totalUsers || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Phòng đang hoạt động", value: statsData?.activeSessions || 0, icon: Activity, color: "text-rose-400", bg: "bg-rose-500/10" },
    { title: "Sự kiện sắp tới", value: statsData?.upcomingEvents || 0, icon: CalendarDays, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Báo cáo cần xử lý", value: statsData?.pendingTickets || 0, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const trafficData = statsData?.trafficData || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
            <div>
              <h2 className="text-lg font-bold text-white">Lưu lượng truy cập hệ thống</h2>
              <p className="text-xs text-muted-foreground mt-1">So với 7 ngày trước</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 cursor-pointer">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl border border-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
              <Link href="/admin/users" className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent hover:from-blue-500/20 border border-blue-500/20 transition-all text-sm text-blue-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <Users className="w-4 h-4 text-blue-400" />
                Quản lý phân quyền Role
              </Link>
              <Link href="/admin/sessions" className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent hover:from-amber-500/20 border border-amber-500/20 transition-all text-sm text-amber-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Duyệt yêu cầu mở Session
              </Link>
              <Link href="/admin/topics" className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-transparent hover:from-violet-500/20 border border-violet-500/20 transition-all text-sm text-violet-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-violet-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <BookOpen className="w-4 h-4 text-violet-400" />
                Thêm chủ đề học mới
              </Link>
              <button 
                onClick={() => alert("Mở modal cấu hình hệ thống Gamification (Ví dụ: Chỉnh exp mỗi phiên)")}
                className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent hover:from-emerald-500/20 border border-emerald-500/20 transition-all text-sm text-emerald-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-emerald-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <Activity className="w-4 h-4 text-emerald-400" />
                Cấu hình Gamification
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
