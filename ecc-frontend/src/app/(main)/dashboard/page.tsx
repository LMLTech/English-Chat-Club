"use client";

import { useEffect, useState } from "react";
import { contentService, MemberDashboardResponse } from "@/features/content/contentService";
import { communityService, MemberPointsResponse, BadgeResponse } from "@/features/community/communityService";
import StatsCard from "@/components/shared/StatsCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { CalendarDays, Trophy, Zap, Star, Award, BookOpen, TrendingUp, Flame, Activity } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl p-8 glass-card border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-transparent opacity-50" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Xin chào, <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text">{user?.fullName?.split(" ").pop() || "bạn"}</span> 👋
            </h1>
          </div>
          <p className="text-muted-foreground">
            Hôm nay là một ngày tuyệt vời để nâng cao kỹ năng giao tiếp tiếng Anh của bạn!
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Buổi học đã tham gia"
          value={dashboard?.totalSessionsAttended ?? 0}
          icon={CalendarDays}
          iconColor="text-blue-400"
          gradient="from-blue-500/10 to-cyan-500/10"
        />
        <StatsCard
          title="Tổng điểm tích lũy"
          value={points?.totalPoints?.toLocaleString() ?? 0}
          subtitle={points?.levelTitle}
          icon={Trophy}
          iconColor="text-amber-400"
          gradient="from-amber-500/10 to-orange-500/10"
        />
        <StatsCard
          title="Đặt chỗ sắp tới"
          value={dashboard?.upcomingBookings ?? 0}
          icon={Zap}
          iconColor="text-violet-400"
          gradient="from-violet-500/10 to-purple-500/10"
        />
        <StatsCard
          title="Huy hiệu đã đạt"
          value={badges.length}
          icon={Award}
          iconColor="text-green-400"
          gradient="from-green-500/10 to-emerald-500/10"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Level progress */}
        <div className="xl:col-span-2 space-y-6">
          {/* Level Card */}
          {points && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  Tiến trình của bạn
                </h2>
                <Link href="/gamification" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Xem chi tiết →
                </Link>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                  <span className="text-2xl font-bold text-white">{points.currentLevel}</span>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-white">{points.levelTitle}</p>
                  <p className="text-sm text-muted-foreground">{points.totalPoints.toLocaleString()} điểm tích lũy</p>
                </div>
              </div>

              {/* Fake progress bar to next level */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Level {points.currentLevel}</span>
                  <span>Level {points.currentLevel + 1}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((points.totalPoints % 1000) / 10, 100)}%`,
                      background: "linear-gradient(90deg, #7c3aed, #3b82f6)"
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Cần thêm {1000 - (points.totalPoints % 1000)} điểm để lên Level {points.currentLevel + 1}
                </p>
              </div>
            </div>
          )}

          {/* Study Activity Chart */}
          <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Hoạt động học tập (XP)
              </h2>
            </div>
            
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studyActivityData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="xp" name="XP Đạt được" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Sessions List */}
          <div className="glass-card rounded-xl p-6 relative overflow-hidden group mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                Lịch học của bạn
              </h2>
            </div>
            
            <div className="flex gap-4 mb-4 border-b border-white/10 pb-2">
              <button 
                onClick={() => setActiveSessionTab('upcoming')}
                className={`text-sm pb-2 font-medium transition-colors relative ${activeSessionTab === 'upcoming' ? 'text-blue-400' : 'text-muted-foreground hover:text-white'}`}
              >
                Sắp diễn ra
                {activeSessionTab === 'upcoming' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-blue-400 rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveSessionTab('ongoing')}
                className={`text-sm pb-2 font-medium transition-colors relative ${activeSessionTab === 'ongoing' ? 'text-emerald-400' : 'text-muted-foreground hover:text-white'}`}
              >
                Đang diễn ra
                {activeSessionTab === 'ongoing' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveSessionTab('closed')}
                className={`text-sm pb-2 font-medium transition-colors relative ${activeSessionTab === 'closed' ? 'text-rose-400' : 'text-muted-foreground hover:text-white'}`}
              >
                Đã đóng
                {activeSessionTab === 'closed' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-rose-400 rounded-full" />}
              </button>
            </div>

            <div className="space-y-3">
              {activeSessionTab === 'upcoming' && (!dashboard?.upcomingSessions || dashboard.upcomingSessions.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">Không có lịch học sắp tới.</p>
              )}
              {activeSessionTab === 'ongoing' && (!dashboard?.ongoingSessions || dashboard.ongoingSessions.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">Không có buổi học nào đang diễn ra.</p>
              )}
              {activeSessionTab === 'closed' && (!dashboard?.closedSessions || dashboard.closedSessions.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">Chưa có lịch sử buổi học.</p>
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
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{session.title || session.TITLE}</p>
                      <p className="text-xs text-muted-foreground">{dateStr} • {timeStr}</p>
                    </div>
                    <Link href={`/sessions`} className="text-xs text-blue-400 hover:underline px-3 py-1 rounded bg-blue-500/10">Chi tiết</Link>
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
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{session.title || session.TITLE}</p>
                      <p className="text-xs text-muted-foreground">{dateStr} • {timeStr}</p>
                      <p className="text-xs text-emerald-400 font-medium mt-1">Đang diễn ra</p>
                    </div>
                    <Link href={`/sessions/${session.id || session.ID}/room`} className="text-xs text-emerald-400 hover:underline px-3 py-1 rounded bg-emerald-500/10">Tham gia ngay</Link>
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
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{session.title || session.TITLE}</p>
                      <p className="text-xs text-muted-foreground">{dateStr} • {timeStr}</p>
                    </div>
                    <span className="text-xs text-rose-400 px-3 py-1 rounded bg-rose-500/10">Đã đóng</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
               <Link href="/sessions" className="text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
                 Tìm thêm buổi học →
               </Link>
            </div>
          </div>
        </div>

        {/* Right: Badges & streak */}
        <div className="space-y-6">
          {/* Recent Badges */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Huy hiệu gần đây
              </h2>
              <Link href="/gamification" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                Tất cả →
              </Link>
            </div>
            {badges.length === 0 ? (
              <div className="text-center py-6">
                <Award className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Chưa có huy hiệu nào</p>
                <p className="text-xs text-muted-foreground">Tham gia buổi học để nhận huy hiệu!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {badges.map((badge) => (
                  <div key={badge.badgeId} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-lg">
                      {badge.iconUrl ? (
                        <img src={badge.iconUrl} alt={badge.name} className="w-6 h-6" />
                      ) : "🏅"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{badge.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Streak */}
          <div className="glass-card rounded-xl p-5">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-orange-400" />
              Streak học tập
            </h2>
            <div className="text-center">
              <div className="text-5xl font-black text-gradient mb-2">
                {dashboard?.currentStreak ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">ngày liên tiếp</p>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-5 rounded-sm ${
                      i < (dashboard?.currentStreak ?? 0) % 7
                        ? "bg-gradient-to-t from-orange-500 to-amber-400"
                        : "bg-white/5"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">7 ngày gần nhất</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
