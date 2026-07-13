"use client";

import { useState, useEffect } from "react";
import { moderatorService, ModeratorSessionRequest } from "@/features/moderator/moderatorService";
import { sessionService, SessionResponse } from "@/features/sessions/sessionService";
import axiosInstance from "@/lib/axios";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Video, Calendar as CalendarIcon, Clock, Users, BookOpen, Search, X, Check, Star, Activity } from "lucide-react";
import { slideIn, staggerContainer, cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Teaching data will be derived from real sessions


export default function ModeratorDashboard() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [topics, setTopics] = useState<any[]>([]);
  
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
    Promise.all([
      sessionService.getSessions(),
      axiosInstance.get('/api/topics').then(res => res.data.data || [])
    ])
      .then(([sessionsData, topicsData]) => {
        const list = Array.isArray(sessionsData) ? sessionsData : (sessionsData?.content || []);
        setSessions(list);
        setTopics(topicsData);
        if (topicsData.length > 0) {
          setForm(prev => ({ ...prev, topicId: topicsData[0].id }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Derive chart data from real sessions (group by day of week)
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const teachingData = dayNames.map(name => {
    const daySessions = sessions.filter(s => {
      const d = new Date(s.startTime);
      return dayNames[d.getDay()] === name;
    });
    return { name, hours: Math.round(daySessions.reduce((sum, s) => sum + (Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000) || 0), 0) / 60 * 10) / 10 };
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Format dates to drop the .SSSZ part so Java LocalDateTime parses it properly
      const formatLocal = (dateString: string) => {
        const d = new Date(dateString);
        return d.getFullYear() + '-' +
               String(d.getMonth() + 1).padStart(2, '0') + '-' +
               String(d.getDate()).padStart(2, '0') + 'T' +
               String(d.getHours()).padStart(2, '0') + ':' +
               String(d.getMinutes()).padStart(2, '0') + ':' +
               String(d.getSeconds()).padStart(2, '0');
      };

      await moderatorService.createSession({
        ...form,
        startTime: formatLocal(form.startTime),
        endTime: formatLocal(form.endTime)
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
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2 tracking-tight">
            <span className="bg-gradient-to-br from-amber-400 to-orange-500 text-transparent bg-clip-text">Moderator Dashboard</span>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
          </h1>
          <p className="text-sm text-muted-foreground/80">Chào mừng trở lại! Bạn có <span className="text-amber-400 font-semibold">{sessions.length}</span> buổi học sắp diễn ra.</p>
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
          <p className="text-3xl font-bold text-white">{sessions.length}</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-blue-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Học viên tham gia</p>
          </div>
          <p className="text-3xl font-bold text-white">{sessions.reduce((sum, s) => sum + (s.currentParticipants || 0), 0)}</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-green-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Đánh giá trung bình</p>
          </div>
          <p className="text-3xl font-bold text-white">—<span className="text-sm text-muted-foreground font-normal">/5</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Thống kê giờ giảng dạy
            </h2>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white outline-none focus:border-amber-500/50 cursor-pointer">
              <option>Tuần này</option>
              <option>Tháng này</option>
            </select>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={teachingData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="hours" name="Giờ dạy" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Trung tâm điều phối</h2>
            <p className="text-sm text-muted-foreground mb-6">Bạn đang là người điều phối cho <strong className="text-white">{sessions.filter(s => s.status === "ACTIVE" || s.status === "IN_PROGRESS").length}</strong> phòng chat active hiện tại. Nhấn vào phòng để bắt đầu buổi nói chuyện.</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full py-4 rounded-xl font-semibold text-black bg-amber-500 hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1"
          >
            + Lên lịch buổi học mới
          </button>
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
                {session.requiredLevel}
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
                <CalendarIcon className="w-4 h-4" /> {new Date(session.startTime).toLocaleDateString("vi-VN")}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> {Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)} phút
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
                  <label className="text-sm font-medium text-white">Chủ đề (Topic)</label>
                  {topics.length > 0 ? (
                    <select value={form.topicId} onChange={e => setForm({...form, topicId: Number(e.target.value)})} className="ecc-input" required>
                      {topics.map(topic => (
                        <option key={topic.id} value={topic.id}>{topic.title || topic.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      Hiện tại chưa có chủ đề (Topic) nào được tạo. Vui lòng liên hệ Admin để tạo chủ đề trước.
                    </div>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Mô tả phòng học</label>
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
                      <option value="A1">A1 Beginner</option>
                      <option value="A2">A2 Elementary</option>
                      <option value="B1">B1 Intermediate</option>
                      <option value="B2">B2 Upper Intermediate</option>
                      <option value="C1">C1 Advanced</option>
                      <option value="C2">C2 Proficient</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Số lượng tối đa</label>
                    <input type="number" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: Number(e.target.value)})} min={2} max={20} required className="ecc-input" />
                  </div>
                </div>

                <button type="submit" disabled={submitting || topics.length === 0} className="w-full py-3 mt-4 rounded-xl font-semibold text-black bg-amber-500 hover:bg-amber-600 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none">
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
