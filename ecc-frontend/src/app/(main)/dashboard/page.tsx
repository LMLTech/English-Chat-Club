"use client";

import { useEffect, useState } from "react";
import { contentService, MemberDashboardResponse } from "@/features/content/contentService";
import { communityService, MemberPointsResponse, BadgeResponse } from "@/features/community/communityService";
import StatsCard from "@/components/shared/StatsCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { CalendarDays, Trophy, Zap, Award, TrendingUp, Flame, Activity, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import Image from "next/image";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const studyActivityData = [
  { name: 'T2', xp: 120 },
  { name: 'T3', xp: 250 },
  { name: 'T4', xp: 50 },
  { name: 'T5', xp: 300 },
  { name: 'T6', xp: 180 },
  { name: 'T7', xp: 400 },
  { name: 'CN', xp: 210 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<MemberDashboardResponse | null>(null);
  const [points, setPoints] = useState<MemberPointsResponse | null>(null);
  const [badges, setBadges] = useState<BadgeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSessionTab, setActiveSessionTab] = useState<'upcoming' | 'ongoing' | 'closed'>('upcoming');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, pointsData, badgesData] = await Promise.all([
          contentService.getMemberDashboard().catch(() => null),
          communityService.getMyPoints().catch(() => null),
          communityService.getMyBadges().catch(() => []),
        ]);
        setDashboard(dashData);
        setPoints(pointsData || { userId: user?.userId || 0, totalPoints: 0, currentLevel: 1, levelTitle: 'Người mới', updatedAt: new Date().toISOString() });
        setBadges((badgesData || []).slice(0, 4));
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Đang tải dashboard..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      
      {/* Welcome Card - Ultra Premium */}
      <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12 glass-panel border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.15)] group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/10 to-transparent opacity-60 mix-blend-overlay" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-violet-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute -bottom-32 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '8s' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
              Xin chào, <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]">{user?.fullName?.split(" ").pop() || "bạn"}</span> 👋
            </h1>
            <p className="text-lg text-slate-300 font-medium max-w-xl leading-relaxed">
              Hôm nay là một ngày tuyệt vời để nâng cao kỹ năng giao tiếp tiếng Anh của bạn. Hãy tiếp tục duy trì ngọn lửa học tập nhé!
            </p>
            <div className="pt-2">
              <Link href="/sessions" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20">
                <Zap className="w-4 h-4 text-cyan-400" /> Khám phá buổi học ngay
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block relative w-48 h-48 lg:w-56 lg:h-56 animate-float-img">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-cyan-500 rounded-full blur-[60px] opacity-20"></div>
            <Image 
              src="/dashboard-welcome-bg.png" 
              alt="Dashboard Welcome" 
              fill 
              className="object-contain drop-shadow-[0_20px_30px_rgba(139,92,246,0.4)] z-10" 
              priority
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="transform transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] rounded-xl">
          <StatsCard
            title="Buổi học đã tham gia"
            value={dashboard?.totalSessionsAttended ?? 0}
            icon={CalendarDays}
            iconColor="text-blue-400"
            gradient="from-blue-600/20 to-cyan-500/10"
          />
        </div>
        <div className="transform transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] rounded-xl">
          <StatsCard
            title="Tổng điểm tích lũy"
            value={points?.totalPoints?.toLocaleString() ?? 0}
            subtitle={points?.levelTitle}
            icon={Trophy}
            iconColor="text-amber-400"
            gradient="from-amber-600/20 to-orange-500/10"
          />
        </div>
        <div className="transform transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] rounded-xl">
          <StatsCard
            title="Đặt chỗ sắp tới"
            value={dashboard?.upcomingBookings ?? 0}
            icon={Zap}
            iconColor="text-violet-400"
            gradient="from-violet-600/20 to-fuchsia-500/10"
          />
        </div>
        <div className="transform transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] rounded-xl">
          <StatsCard
            title="Huy hiệu đã đạt"
            value={badges.length}
            icon={Award}
            iconColor="text-emerald-400"
            gradient="from-emerald-600/20 to-teal-500/10"
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left: Level progress & Charts */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Level Card */}
          {points && (
            <div className="glass-panel rounded-2xl p-6 lg:p-8 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-400" />
                  Tiến trình của bạn
                </h2>
                <Link href="/gamification" className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors hover:underline">
                  Xem chi tiết →
                </Link>
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(167,139,250,0.5)] animate-pulse" style={{animationDuration: '3s'}}>
                  <span className="text-3xl font-black text-white drop-shadow-md">{points.currentLevel}</span>
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white tracking-tight">{points.levelTitle}</p>
                  <p className="text-sm text-slate-400 font-medium mt-1">{points.totalPoints.toLocaleString()} XP hiện tại</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                  <span>Level {points.currentLevel}</span>
                  <span>Level {points.currentLevel + 1}</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-black/40 overflow-hidden border border-white/5 shadow-inner">
                  <div
                    className="h-full rounded-full relative"
                    style={{
                      width: `${Math.min((points.totalPoints % 1000) / 10, 100)}%`,
                      background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
                      boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)"
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }} />
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-2 font-medium">
                  Cần thêm <strong className="text-violet-400">{1000 - (points.totalPoints % 1000)} XP</strong> để thăng cấp.
                </p>
              </div>
            </div>
          )}

          {/* Study Activity Chart */}
          <div className="glass-panel rounded-2xl p-6 lg:p-8 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Hoạt động học tập (XP)
              </h2>
            </div>
            
            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studyActivityData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={13} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={13} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(5, 5, 10, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', color: '#fff', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="xp" name="XP Đạt được" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Sessions List */}
          <div className="glass-panel rounded-2xl p-6 lg:p-8 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-400" />
                Lịch học của bạn
              </h2>
            </div>
            
            <div className="flex gap-6 mb-6 border-b border-white/10 pb-2">
              <button 
                onClick={() => setActiveSessionTab('upcoming')}
                className={`text-sm pb-2 font-semibold transition-colors relative ${activeSessionTab === 'upcoming' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                Sắp diễn ra
                {activeSessionTab === 'upcoming' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
              </button>
              <button 
                onClick={() => setActiveSessionTab('ongoing')}
                className={`text-sm pb-2 font-semibold transition-colors relative ${activeSessionTab === 'ongoing' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              >
                Đang diễn ra
                {activeSessionTab === 'ongoing' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
              </button>
              <button 
                onClick={() => setActiveSessionTab('closed')}
                className={`text-sm pb-2 font-semibold transition-colors relative ${activeSessionTab === 'closed' ? 'text-rose-400' : 'text-slate-400 hover:text-white'}`}
              >
                Đã đóng
                {activeSessionTab === 'closed' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-rose-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]" />}
              </button>
            </div>

            <div className="space-y-4">
              {activeSessionTab === 'upcoming' && (!dashboard?.upcomingSessions || dashboard.upcomingSessions.length === 0) && (
                <div className="py-8 text-center bg-black/20 rounded-xl border border-white/5">
                  <p className="text-sm text-slate-400 font-medium">Không có lịch học sắp tới.</p>
                </div>
              )}
              {activeSessionTab === 'ongoing' && (!dashboard?.ongoingSessions || dashboard.ongoingSessions.length === 0) && (
                <div className="py-8 text-center bg-black/20 rounded-xl border border-white/5">
                  <p className="text-sm text-slate-400 font-medium">Không có buổi học nào đang diễn ra.</p>
                </div>
              )}
              {activeSessionTab === 'closed' && (!dashboard?.closedSessions || dashboard.closedSessions.length === 0) && (
                <div className="py-8 text-center bg-black/20 rounded-xl border border-white/5">
                  <p className="text-sm text-slate-400 font-medium">Chưa có lịch sử buổi học.</p>
                </div>
              )}

              {activeSessionTab === 'upcoming' && dashboard?.upcomingSessions?.map((session, i) => {
                const startTime = session.startTime || session.start_time || session.STARTTIME || session.START_TIME;
                const endTime = session.endTime || session.end_time || session.ENDTIME || session.END_TIME;
                const d = new Date(startTime);
                const e = new Date(endTime || startTime);
                const pad = (n: number) => n.toString().padStart(2, '0');
                const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
                const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())}`;
                
                return (
                  <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group">
                    <div>
                      <p className="text-[15px] font-bold text-white group-hover:text-blue-300 transition-colors">{session.title || session.TITLE}</p>
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {dateStr} • {timeStr}</p>
                    </div>
                    <Link href={`/sessions`} className="text-sm font-semibold text-blue-400 hover:text-white px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/30 transition-colors border border-blue-500/20">Chi tiết</Link>
                  </div>
                );
              })}
              
              {activeSessionTab === 'ongoing' && dashboard?.ongoingSessions?.map((session, i) => {
                const startTime = session.startTime || session.start_time || session.STARTTIME || session.START_TIME;
                const endTime = session.endTime || session.end_time || session.ENDTIME || session.END_TIME;
                const d = new Date(startTime);
                const e = new Date(endTime || startTime);
                const pad = (n: number) => n.toString().padStart(2, '0');
                const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
                const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())}`;
                
                return (
                  <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <div>
                      <p className="text-[15px] font-bold text-white group-hover:text-emerald-300 transition-colors">{session.title || session.TITLE}</p>
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {dateStr} • {timeStr}</p>
                      <p className="text-xs text-emerald-400 font-bold mt-1.5 flex items-center gap-1 uppercase tracking-wider"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đang diễn ra</p>
                    </div>
                    <Link href={`/sessions/${session.id || session.ID}/room`} className="text-sm font-bold text-white hover:text-emerald-950 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]">Tham gia ngay</Link>
                  </div>
                );
              })}

              {activeSessionTab === 'closed' && dashboard?.closedSessions?.map((session, i) => {
                const startTime = session.startTime || session.start_time || session.STARTTIME || session.START_TIME;
                const endTime = session.endTime || session.end_time || session.ENDTIME || session.END_TIME;
                const d = new Date(startTime);
                const e = new Date(endTime || startTime);
                const pad = (n: number) => n.toString().padStart(2, '0');
                const dateStr = `${pad(e.getDate())}/${pad(e.getMonth() + 1)}/${e.getFullYear()}`;
                const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())}`;
                
                return (
                  <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-black/30 border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                    <div>
                      <p className="text-[15px] font-bold text-slate-300">{session.title || session.TITLE}</p>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {dateStr} • {timeStr}</p>
                    </div>
                    <span className="text-xs font-bold text-rose-400 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 uppercase tracking-wider">Đã đóng</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
               <Link href="/sessions" className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-violet-300 hover:text-violet-200 transition-colors font-bold border border-white/5">
                 Tìm thêm buổi học <ArrowRight className="w-4 h-4 ml-2" />
               </Link>
            </div>
          </div>
        </div>

        {/* Right: Badges & streak */}
        <div className="space-y-6">
          
          {/* Streak */}
          <div className="glass-panel rounded-2xl p-6 lg:p-8 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-shadow relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-[40px] group-hover:bg-orange-500/30 transition-colors" />
            
            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2 mb-6">
              <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
              Streak học tập
            </h2>
            <div className="text-center relative z-10">
              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-300 via-orange-500 to-rose-600 mb-2 drop-shadow-[0_5px_5px_rgba(249,115,22,0.3)]">
                {dashboard?.currentStreak ?? 0}
              </div>
              <p className="text-sm font-bold text-orange-200 uppercase tracking-widest mb-6">Ngày liên tiếp</p>
              
              <div className="flex justify-center gap-2 mt-4 bg-black/20 p-4 rounded-xl border border-white/5">
                {Array.from({ length: 7 }).map((_, i) => {
                  const isActive = i < (dashboard?.currentStreak ?? 0) % 7;
                  return (
                    <div
                      key={i}
                      className={`w-full h-8 rounded-md transition-all duration-500 ${
                        isActive
                          ? "bg-gradient-to-t from-orange-600 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)] scale-110"
                          : "bg-white/5"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-3 font-medium">Lịch sử 7 ngày gần nhất</p>
            </div>
          </div>
          
          {/* Recent Badges */}
          <div className="glass-panel rounded-2xl p-6 lg:p-8 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Huy hiệu gần đây
              </h2>
              <Link href="/gamification" className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors hover:underline">
                Tất cả →
              </Link>
            </div>
            
            {badges.length === 0 ? (
              <div className="text-center py-10 bg-black/20 rounded-xl border border-white/5">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-sm font-semibold text-slate-300 mb-1">Chưa có huy hiệu nào</p>
                <p className="text-xs text-slate-500">Tham gia buổi học để nhận ngay!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {badges.map((badge) => (
                  <div key={badge.badgeId} className="flex items-center gap-4 p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-2xl shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:scale-110 transition-transform">
                      {badge.iconUrl ? (
                        <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8 drop-shadow-md" />
                      ) : "🏅"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-white truncate">{badge.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
