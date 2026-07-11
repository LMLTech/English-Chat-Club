"use client";

import { useEffect, useState } from "react";
import { contentService, MemberDashboardResponse } from "@/features/content/contentService";
import { communityService, MemberPointsResponse, BadgeResponse } from "@/features/community/communityService";
import StatsCard from "@/components/shared/StatsCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { CalendarDays, Trophy, Zap, Star, Award, BookOpen, TrendingUp, Flame } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

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
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">
            Xin chào, {user?.fullName?.split(" ").pop() || "bạn"} 👋
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Chào mừng trở lại với English Chat Club. Hãy tiếp tục hành trình học tiếng Anh hôm nay!
        </p>
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

          {/* Quick actions */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Hành động nhanh
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Tìm buổi học", href: "/sessions", icon: CalendarDays, color: "from-blue-500/20 to-cyan-500/10 border-blue-500/20" },
                { label: "Diễn đàn", href: "/forum", icon: BookOpen, color: "from-violet-500/20 to-purple-500/10 border-violet-500/20" },
                { label: "Bảng xếp hạng", href: "/leaderboard", icon: Trophy, color: "from-amber-500/20 to-orange-500/10 border-amber-500/20" },
                { label: "Bạn bè", href: "/friends", icon: Star, color: "from-green-500/20 to-emerald-500/10 border-green-500/20" },
                { label: "Tài nguyên", href: "/resources", icon: BookOpen, color: "from-pink-500/20 to-rose-500/10 border-pink-500/20" },
                { label: "Huy hiệu", href: "/gamification", icon: Award, color: "from-purple-500/20 to-indigo-500/10 border-purple-500/20" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border bg-gradient-to-br ${item.color} hover:scale-105 transition-transform duration-200 text-center`}
                  >
                    <Icon className="w-5 h-5 text-foreground/70" />
                    <span className="text-xs font-medium text-foreground/80">{item.label}</span>
                  </Link>
                );
              })}
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
