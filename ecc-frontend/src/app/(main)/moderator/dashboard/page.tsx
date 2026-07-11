"use client";

import { useState, useEffect } from "react";
import { moderatorService, ModeratorSessionRequest } from "@/features/moderator/moderatorService";
import { sessionService, SessionResponse } from "@/features/sessions/sessionService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Video, Calendar as CalendarIcon, Clock, Users, BookOpen, Search, X, Check, Star } from "lucide-react";
import { slideIn, staggerContainer, cn } from "@/lib/utils";

export default function ModeratorDashboard() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  
  const [form, setForm] = useState<ModeratorSessionRequest>({
    topicId: 1,
    title: "",
    description: "",
    coverImage: "",
    maxParticipants: 5,
    requiredLevel: "B1",
    startTime: "",
    endTime: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // In a real flow, fetch upcoming sessions from the moderator. We mock this since there's no GET API for it yet.
    setSessions([
      {
        id: 1,
        title: "IELTS Speaking Part 1",
        cefrLevel: "B2",
        status: "ACTIVE",
        durationMinutes: 45,
        maxParticipants: 5,
        currentParticipants: 3,
        moderatorId: 1,
        scheduledAt: new Date(Date.now() + 86400000).toISOString()
      }
    ]);
    setLoading(false);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await moderatorService.createSession({
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString()
      });
      toast.success("Đã gửi yêu cầu tạo buổi học thành công (Chờ admin duyệt)!");
      setIsCreating(false);
      setForm({ ...form, title: "", description: "", startTime: "", endTime: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo buổi học");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Đang tải dữ liệu Moderator..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
            <Video className="w-6 h-6 text-amber-400" />
            Moderator Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Quản lý và tạo các phòng hội thoại của bạn</p>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary bg-amber-500 hover:bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2 px-6 text-black"
        >
          <Plus className="w-4 h-4" />
          Tạo Buổi học Mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-xl border border-amber-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Buổi đã dạy</p>
          </div>
          <p className="text-3xl font-bold text-white">42</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-blue-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Học viên tham gia</p>
          </div>
          <p className="text-3xl font-bold text-white">156</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-green-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Đánh giá trung bình</p>
          </div>
          <p className="text-3xl font-bold text-white">4.9<span className="text-sm text-muted-foreground font-normal">/5</span></p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
        <button 
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "text-sm font-medium transition-colors pb-4 -mb-4 border-b-2",
            activeTab === "upcoming" ? "text-amber-400 border-amber-400" : "text-muted-foreground border-transparent hover:text-white"
          )}
        >
          Sắp diễn ra
        </button>
        <button 
          onClick={() => setActiveTab("past")}
          className={cn(
            "text-sm font-medium transition-colors pb-4 -mb-4 border-b-2",
            activeTab === "past" ? "text-amber-400 border-amber-400" : "text-muted-foreground border-transparent hover:text-white"
          )}
        >
          Đã kết thúc
        </button>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map(session => (
          <motion.div key={session.id} variants={slideIn} className="glass-card rounded-2xl p-5 border border-white/5 hover:border-amber-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold tracking-wider border border-amber-500/20">
                {session.cefrLevel}
              </span>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {session.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-amber-300 transition-colors">
              {session.title}
            </h3>
            <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> {new Date(session.scheduledAt).toLocaleDateString("vi-VN")}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> {session.durationMinutes} phút
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> {session.currentParticipants}/{session.maxParticipants} học viên
              </p>
            </div>
            <div className="mt-6 flex gap-2">
              <a href={`/sessions/${session.id}/room`} className="flex-1 py-2 rounded-lg bg-amber-500/10 text-amber-400 font-medium text-sm hover:bg-amber-500/20 transition-colors text-center inline-block">
                Bắt đầu
              </a>
              <button className="px-4 py-2 rounded-lg bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-colors">
                Sửa
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#1a1d2d] rounded-2xl border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Tạo Buổi Học Mới</h2>
                <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Tiêu đề phòng học</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ví dụ: IELTS Speaking Part 2" required className="ecc-input" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Mô tả chủ đề (Topic)</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="ecc-input resize-none" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Bắt đầu</label>
                    <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required className="ecc-input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Kết thúc</label>
                    <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required className="ecc-input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Trình độ CEFR</label>
                    <select value={form.requiredLevel} onChange={e => setForm({...form, requiredLevel: e.target.value})} className="ecc-input">
                      <option value="A2">A2 Elementary</option>
                      <option value="B1">B1 Intermediate</option>
                      <option value="B2">B2 Upper Intermediate</option>
                      <option value="C1">C1 Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Số lượng tối đa</label>
                    <input type="number" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: Number(e.target.value)})} min={2} max={20} required className="ecc-input" />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-3 mt-4 rounded-xl font-semibold text-black bg-amber-500 hover:bg-amber-600 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50">
                  {submitting ? "Đang gửi..." : "Tạo & Chờ Duyệt"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
