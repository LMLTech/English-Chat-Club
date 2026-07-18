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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 mb-2 tracking-tight drop-shadow-md">
            <span className="bg-gradient-to-br from-red-400 via-rose-400 to-red-600 text-transparent bg-clip-text">Admin Dashboard</span>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          </h1>
          <p className="text-slate-300 font-medium">Trung tâm đầu não quản trị toàn hệ thống.</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-bold text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
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
              className="relative glass-panel p-6 rounded-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-[spin_4s_linear_infinite] blur-xl pointer-events-none transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-black/20 ${stat.color} border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 drop-shadow-md" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">{stat.title}</p>
                </div>
                <h3 className="text-4xl font-black text-white drop-shadow-sm">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Animated Chart Section */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-red-900/10 opacity-50" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-400" />
                Lưu lượng truy cập hệ thống
              </h2>
              <p className="text-xs text-slate-400 mt-1">So với 7 ngày trước</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-500/50 cursor-pointer shadow-inner">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          
          <div className="h-72 w-full mt-4 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="users" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
          
          {/* Welcome Illustration Block */}
          <div className="glass-panel rounded-2xl relative overflow-hidden group min-h-[160px] flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-rose-900/40 to-black z-0" />
            
            <div className="absolute right-[-20%] bottom-[-50%] w-[150%] h-[150%] pointer-events-none z-0">
              <img 
                src="/admin-welcome-bg.png" 
                alt="Admin Illustration" 
                className="w-full h-full object-cover object-right-bottom opacity-60 animate-float-img mix-blend-screen"
              />
            </div>

            <div className="relative z-10 p-6 flex flex-col justify-center h-full w-[70%]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold mb-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <ShieldCheck className="w-3 h-3" /> MASTER CONTROL
              </div>
              <h2 className="text-xl font-black text-white leading-tight drop-shadow-md">Nắm giữ <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Quyền Lực</span></h2>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
              <Link href="/admin/users" className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent hover:from-blue-500/20 border border-blue-500/20 transition-all text-sm text-blue-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <Users className="w-4 h-4 text-blue-400 drop-shadow-md" />
                Quản lý phân quyền Role
              </Link>
              <Link href="/admin/sessions" className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent hover:from-amber-500/20 border border-amber-500/20 transition-all text-sm text-amber-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <ShieldCheck className="w-4 h-4 text-amber-400 drop-shadow-md" />
                Duyệt yêu cầu mở Session
              </Link>
              <Link href="/admin/topics" className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-transparent hover:from-violet-500/20 border border-violet-500/20 transition-all text-sm text-violet-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-violet-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <BookOpen className="w-4 h-4 text-violet-400 drop-shadow-md" />
                Thêm chủ đề học mới
              </Link>
              <button 
                onClick={() => alert("Mở modal cấu hình hệ thống Gamification (Ví dụ: Chỉnh exp mỗi phiên)")}
                className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent hover:from-emerald-500/20 border border-emerald-500/20 transition-all text-sm text-emerald-100 font-medium flex items-center gap-3 group/btn relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-emerald-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <Activity className="w-4 h-4 text-emerald-400 drop-shadow-md" />
                Cấu hình Gamification
              </button>
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Mới đây</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate font-medium">Hệ thống database đã backup.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Vài giây trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
