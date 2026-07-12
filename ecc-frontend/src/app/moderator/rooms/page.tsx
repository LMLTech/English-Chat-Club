"use client";

import { useState, useEffect } from "react";
import { sessionService, SessionResponse } from "@/features/sessions/sessionService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, slideIn, cn } from "@/lib/utils";
import {
  Video, VideoOff, Users, Clock, Calendar,
  Search, Filter, Play, Eye, Mic, MicOff,
  CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import Link from "next/link";

type RoomTab = "active" | "upcoming" | "ended";

export default function ModeratorRoomsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RoomTab>("active");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    sessionService.getSessions()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data?.content || []);
        setSessions(list);
      })
      .catch(() => toast.error("Không thể tải danh sách phòng"))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": case "IN_PROGRESS": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "SCHEDULED": case "PENDING": case "APPROVED": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "COMPLETED": case "ENDED": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "CANCELLED": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const status = s.status?.toUpperCase();
    if (activeTab === "active") return matchesSearch && (status === "ACTIVE" || status === "IN_PROGRESS");
    if (activeTab === "upcoming") return matchesSearch && (status === "SCHEDULED" || status === "PENDING" || status === "APPROVED");
    if (activeTab === "ended") return matchesSearch && (status === "COMPLETED" || status === "ENDED" || status === "CANCELLED");
    return matchesSearch;
  });

  if (loading) return <LoadingSpinner size="lg" text="Đang tải phòng học..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">Quản lý Phòng học</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi và điều phối các phòng học trực tuyến của bạn
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm phòng học..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
        {([
          { key: "active", label: "Đang diễn ra", icon: Play },
          { key: "upcoming", label: "Sắp diễn ra", icon: Clock },
          { key: "ended", label: "Đã kết thúc", icon: CheckCircle2 },
        ] as const).map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-amber-500/20 text-amber-400 shadow-sm"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            {activeTab === "active" ? "Không có phòng nào đang hoạt động" :
             activeTab === "upcoming" ? "Chưa có phòng nào được lên lịch" :
             "Chưa có phòng nào kết thúc"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filteredSessions.map(session => (
            <motion.div
              key={session.id}
              variants={slideIn}
              className="glass-card rounded-2xl p-5 border border-white/5 hover:border-amber-500/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
            >
              {/* Status Badge & Level */}
              <div className="flex items-center justify-between mb-4">
                <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border", getStatusColor(session.status))}>
                  {session.status}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-bold border border-violet-500/20">
                  {session.cefrLevel}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-amber-300 transition-colors">
                {session.title}
              </h3>

              {/* Meta Info */}
              <div className="space-y-2 pt-3 border-t border-white/5">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  {new Date(session.scheduledAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  {session.durationMinutes} phút
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{session.currentParticipants}/{session.maxParticipants} học viên</span>
                  {/* Progress bar */}
                  <span className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <span
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full block transition-all"
                      style={{ width: `${(session.currentParticipants / session.maxParticipants) * 100}%` }}
                    />
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-2">
                {(session.status === "ACTIVE" || session.status === "IN_PROGRESS") ? (
                  <Link
                    href={`/sessions/${session.id}/room`}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-all text-center shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    Vào phòng
                  </Link>
                ) : (
                  <Link
                    href={`/sessions/${session.id}/room`}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-colors text-center border border-white/10"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Xem chi tiết
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
