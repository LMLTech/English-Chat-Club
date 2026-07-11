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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, pointsData, badgesData] = await Promise.all([
          contentService.getMemberDashboard(),
          communityService.getMyPoints(),
          communityService.getMyBadges(),
        ]);
        setDashboard(dashData);
        setPoints(pointsData);
        setBadges(badgesData.slice(0, 4));
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
          value={dashboard?.totalSessions ?? 0}
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
          
          {/* Upcoming Sessions (Lịch học đã đăng ký) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                  Lịch học sắp tới của bạn
                </h2>
                <button 
                  onClick={() => alert("Đã gửi yêu cầu kết nối Google Calendar!")}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Kết nối Google Calendar
                </button>
              </div>
              
              {dashboard?.upcomingBookings === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl relative z-10">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Bạn chưa đăng ký buổi học nào.</p>
                  <Link href="/sessions" className="text-violet-400 text-sm hover:underline mt-2 inline-block font-medium">
                    Tìm buổi học ngay →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-blue-500/5 relative z-10 border-blue-500/20">
                  <CalendarDays className="w-10 h-10 text-blue-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-sm font-medium text-white">Bạn có {dashboard?.upcomingBookings} buổi học sắp tới.</p>
                  <Link href="/sessions" className="text-blue-400 text-sm hover:underline mt-2 inline-block font-medium">
                    Vào phòng chờ ngay →
                  </Link>
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group border-amber-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
              <div className="relative z-10">
                <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Thử thách tuần!</h3>
                <p className="text-sm text-muted-foreground mb-4">Tham gia 3 buổi học tuần này để nhận Badge "Ngôi sao chăm chỉ" và 500 XP.</p>
                <Link href="/gamification" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  Xem nhiệm vụ
                </Link>
              </div>
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
                {dashboard?.streakDays ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">ngày liên tiếp</p>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-5 rounded-sm ${
                      i < (dashboard?.streakDays ?? 0) % 7
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
