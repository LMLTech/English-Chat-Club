"use client";

import { useState, useEffect } from "react";
import { sessionService, SessionResponse } from "@/features/sessions/sessionService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { staggerContainer, slideIn, cn } from "@/lib/utils";
import {
  Calendar, Clock, Users, Video,
  CheckCircle2, Star, Search, Filter,
  TrendingUp, BookOpen
} from "lucide-react";

export default function ModeratorHistoryPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    sessionService.getSessions()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data?.content || []);
        // Show all sessions as history
        setSessions(list);
      })
      .catch(() => toast.error("Không thể tải lịch sử dạy"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner size="lg" text="Đang tải lịch sử..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">Lịch sử giảng dạy</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem lại tất cả các buổi học bạn đã điều phối
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-card p-4 rounded-xl border border-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng buổi dạy</p>
              <p className="text-2xl font-bold text-white">{sessions.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 rounded-xl border border-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng học viên</p>
              <p className="text-2xl font-bold text-white">{sessions.reduce((sum, s) => sum + (s.currentParticipants || 0), 0)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 rounded-xl border border-violet-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng giờ dạy</p>
              <p className="text-2xl font-bold text-white">{Math.round(sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60)}h</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm buổi học..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* Sessions List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Chưa có lịch sử giảng dạy</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map((session, idx) => (
            <motion.div
              key={session.id}
              variants={slideIn}
              className="glass-card rounded-xl p-5 border border-white/5 hover:border-amber-500/20 transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-4 group hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            >
              {/* Index */}
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
                {idx + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                  {session.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(session.scheduledAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {session.durationMinutes} phút
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {session.currentParticipants}/{session.maxParticipants}
                  </span>
                </div>
              </div>

              {/* Level & Status */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-bold border border-violet-500/20">
                  {session.cefrLevel}
                </span>
                <span className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-bold border",
                  session.status === "COMPLETED" || session.status === "ENDED"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                )}>
                  {session.status}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
