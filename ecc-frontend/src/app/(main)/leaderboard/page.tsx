"use client";

import { useEffect, useState } from "react";
import { communityService, LeaderboardEntryResponse } from "@/features/community/communityService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const MOCK_LEADERBOARD: LeaderboardEntryResponse[] = [
  { rank: 1, userId: 10, username: "Nguyễn Thị Lan", totalPoints: 4250, cefrLevel: "C1", avatarUrl: undefined },
  { rank: 2, userId: 11, username: "Trần Văn Minh", totalPoints: 3890, cefrLevel: "B2" },
  { rank: 3, userId: 12, username: "Lê Thị Hoa", totalPoints: 3540, cefrLevel: "B2" },
  { rank: 4, userId: 13, username: "Phạm Quốc Hùng", totalPoints: 3120, cefrLevel: "B1" },
  { rank: 5, userId: 14, username: "Đặng Thị Mai", totalPoints: 2980, cefrLevel: "B1" },
  { rank: 6, userId: 15, username: "Hoàng Văn An", totalPoints: 2750, cefrLevel: "B1" },
  { rank: 7, userId: 16, username: "Vũ Thị Linh", totalPoints: 2540, cefrLevel: "A2" },
  { rank: 8, userId: 17, username: "Bùi Quốc Dũng", totalPoints: 2320, cefrLevel: "A2" },
  { rank: 9, userId: 18, username: "Đinh Thị Thảo", totalPoints: 2100, cefrLevel: "A2" },
  { rank: 10, userId: 19, username: "Ngô Văn Đức", totalPoints: 1980, cefrLevel: "A1" },
];

type LeaderboardType = "weekly" | "monthly";

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
};

const getRankBg = (rank: number) => {
  if (rank === 1) return "border-amber-500/30 bg-amber-500/5";
  if (rank === 2) return "border-gray-400/30 bg-gray-400/5";
  if (rank === 3) return "border-amber-700/30 bg-amber-700/5";
  return "border-white/5 bg-white/2";
};

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryResponse[]>(MOCK_LEADERBOARD);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [type, setType] = useState<LeaderboardType>("weekly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lb, rank] = await Promise.all([
          communityService.getLeaderboard({ type, top: 100 }),
          communityService.getMyRank(type),
        ]);
        if (lb.length > 0) setLeaderboard(lb);
        setMyRank(rank);
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <Trophy className="w-6 h-6 text-amber-400" />
          Bảng xếp hạng
        </h1>
        <p className="text-muted-foreground text-sm">Top thành viên tích cực nhất trong cộng đồng ECC</p>
      </div>

      {/* Type Toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
        {[
          { id: "weekly", label: "Tuần này" },
          { id: "monthly", label: "Tháng này" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setType(tab.id as LeaderboardType)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              type === tab.id
                ? "bg-violet-500 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Rank */}
      {myRank && (
        <div className="glass-card rounded-xl p-4 border-violet-500/20 bg-violet-500/5">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <p className="text-sm text-foreground">
              Xếp hạng của bạn: <strong className="text-violet-400 text-base">#{myRank}</strong>
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Đang tải bảng xếp hạng..." />
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[topThree[1], topThree[0], topThree[2]].filter(Boolean).map((entry, i) => {
              const positions = [2, 1, 3];
              const pos = positions[i];
              const heights = ["h-24", "h-32", "h-20"];
              const isFirst = pos === 1;
              return (
                <div
                  key={entry.userId}
                  className={`flex flex-col items-center justify-end rounded-xl pt-4 pb-4 px-3 border bg-gradient-to-t ${
                    pos === 1 ? "from-amber-500/20 border-amber-500/30" :
                    pos === 2 ? "from-gray-400/15 border-gray-400/20" :
                    "from-amber-700/15 border-amber-700/20"
                  } ${heights[i]}`}
                >
                  <div className={`w-10 h-10 rounded-full mb-2 flex items-center justify-center text-sm font-bold text-white ${
                    pos === 1 ? "bg-amber-500" : pos === 2 ? "bg-gray-400" : "bg-amber-700"
                  }`}>
                    {entry.username[0]}
                  </div>
                  <p className="text-xs font-semibold text-foreground text-center truncate w-full">{entry.username.split(" ").pop()}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.totalPoints.toLocaleString()} pts</p>
                  <div className={`mt-1.5 text-xs font-bold ${
                    pos === 1 ? "text-amber-400" : pos === 2 ? "text-gray-300" : "text-amber-700"
                  }`}>#{pos}</div>
                </div>
              );
            })}
          </div>

          {/* Full List */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Danh sách đầy đủ</h2>
              <span className="text-xs text-muted-foreground">{leaderboard.length} thành viên</span>
            </div>
            <div className="divide-y divide-white/5">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors border-l-2 ${
                    entry.userId === user?.userId
                      ? "border-l-violet-500 bg-violet-500/5"
                      : "border-l-transparent"
                  } ${getRankBg(entry.rank)}`}
                >
                  <div className="w-6 flex-shrink-0 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/60 to-blue-500/60 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {entry.avatarUrl ? (
                      <img src={entry.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{entry.username[0]}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      entry.userId === user?.userId ? "text-violet-300" : "text-foreground"
                    }`}>
                      {entry.username}
                      {entry.userId === user?.userId && <span className="ml-2 text-xs text-violet-400">(Bạn)</span>}
                    </p>
                    {entry.cefrLevel && (
                      <p className="text-xs text-muted-foreground">{entry.cefrLevel}</p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gradient">{entry.totalPoints.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">điểm</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
