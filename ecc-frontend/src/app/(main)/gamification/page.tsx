"use client";

import { useEffect, useState } from "react";
import { communityService, MemberPointsResponse, PointTransactionResponse, BadgeResponse } from "@/features/community/communityService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { Trophy, Award, TrendingUp, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getGamificationProgress } from "@/lib/utils";

export default function GamificationPage() {
  const [points, setPoints] = useState<MemberPointsResponse | null>(null);
  const [transactions, setTransactions] = useState<PointTransactionResponse[]>([]);
  const [badges, setBadges] = useState<BadgeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"points" | "badges">("points");

  useEffect(() => {
    Promise.all([
      communityService.getMyPoints(),
      communityService.getMyTransactions(),
      communityService.getMyBadges(),
    ]).then(([p, t, b]) => {
      setPoints(p);
      setTransactions(t);
      setBadges(b);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Đang tải thông tin điểm..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <Trophy className="w-6 h-6 text-amber-400" />
          Điểm & Huy hiệu
        </h1>
        <p className="text-muted-foreground text-sm">Theo dõi tiến trình và thành tích của bạn</p>
      </div>

      {/* Points Summary */}
      {points && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex flex-col items-center justify-center flex-shrink-0 animate-pulse-glow">
              <Trophy className="w-8 h-8 text-white mb-1" />
              <span className="text-xs font-bold text-white/80">LEVEL</span>
              <span className="text-2xl font-black text-white">{points.currentLevel}</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">{points.levelTitle}</h2>
              <p className="text-4xl font-black text-gradient mb-1">
                {points.totalPoints.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">tổng điểm tích lũy</p>
            </div>

            {/* Progress to next level */}
            <div className="w-full sm:w-48 flex-shrink-0">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Level {points.currentLevel}</span>
                <span>Level {points.currentLevel >= 6 ? 6 : points.currentLevel + 1}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${getGamificationProgress(points.totalPoints).percentage}%`,
                    background: "linear-gradient(90deg, #f59e0b, #ef4444)"
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {getGamificationProgress(points.totalPoints).currentLevel >= 6 
                  ? "Đã đạt cấp tối đa" 
                  : `${getGamificationProgress(points.totalPoints).pointsNeededForNext.toLocaleString()} điểm nữa`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
        {[
          { id: "points", label: "Lịch sử điểm", icon: TrendingUp },
          { id: "badges", label: "Huy hiệu", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-violet-500 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === "badges" && badges.length > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {badges.length}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab("levels" as any)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "levels"
              ? "bg-violet-500 text-white shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Bảng phân bậc điểm
        </button>
      </div>

      {/* Points History */}
      {activeTab === "points" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h2 className="text-sm font-semibold text-foreground">Lịch sử giao dịch điểm</h2>
          </div>
          {transactions.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Chưa có lịch sử điểm"
              description="Tham gia buổi học, đăng bài viết để nhận điểm!"
            />
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.points > 0 ? "bg-green-500/15" : "bg-red-500/15"
                  }`}>
                    {tx.points > 0 ? (
                      <ArrowUpCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{tx.reason}</p>
                    {tx.description && (
                      <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(tx.occurredAt), "HH:mm - dd/MM/yyyy", { locale: vi })}
                    </p>
                  </div>
                  <div className={`text-base font-bold flex-shrink-0 ${
                    tx.points > 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {tx.points > 0 ? "+" : ""}{tx.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      {activeTab === "badges" && (
        <>
          {badges.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Chưa có huy hiệu nào"
              description="Hoàn thành các thử thách để nhận huy hiệu đặc biệt!"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div key={badge.badgeId} className="glass-card rounded-xl p-5 border border-amber-500/10 hover:border-amber-500/25 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-2xl">
                      {badge.iconUrl ? (
                        <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8" />
                      ) : "🏅"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white mb-1">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
                      <p className="text-[10px] text-amber-400/70 mt-2">
                        Đạt được: {format(new Date(badge.awardedAt), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Levels Breakdown */}
      {activeTab === "levels" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-semibold text-foreground">Bảng phân bậc trình độ (CEFR)</h2>
          </div>
          <div className="p-5 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Cấp độ Gamification</th>
                  <th className="px-4 py-3">Trình độ CEFR</th>
                  <th className="px-4 py-3 rounded-r-lg">Điểm yêu cầu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { gamification: "Level 1", cefr: "A1", points: "0 - 999" },
                  { gamification: "Level 2", cefr: "A2", points: "1,000 - 2,999" },
                  { gamification: "Level 3", cefr: "B1", points: "3,000 - 5,999" },
                  { gamification: "Level 4", cefr: "B2", points: "6,000 - 9,999" },
                  { gamification: "Level 5", cefr: "C1", points: "10,000 - 14,999" },
                  { gamification: "Level 6", cefr: "C2", points: "15,000+" },
                ].map((level, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{level.gamification}</td>
                    <td className="px-4 py-3 text-amber-400 font-bold">{level.cefr}</td>
                    <td className="px-4 py-3 text-muted-foreground">{level.points} điểm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
