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
import Link from 'next/link';

// Teaching data will be derived from real sessions


export default function ModeratorDashboard() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [topics, setTopics] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<string>("—");
  
  const [form, setForm] = useState({
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
      moderatorService.getSessions(),
      axiosInstance.get('/api/topics').then(res => res.data.data || []),
      moderatorService.getReviews().catch(() => [])
    ])
      .then(([sessionsData, topicsData, reviewsData]) => {
        const list = Array.isArray(sessionsData) ? sessionsData : (sessionsData as any)?.content || [];
        setSessions(list);
        setTopics(topicsData);
        if (topicsData.length > 0) {
          setForm(prev => ({ ...prev, topicId: topicsData[0].id }));
        }
        
        // Calculate average rating
        const revs = Array.isArray(reviewsData) ? reviewsData : [];
        if (revs.length > 0) {
          const avg = revs.reduce((sum, r) => sum + r.rating, 0) / revs.length;
          setAvgRating(avg.toFixed(1));
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
        // datetime-local input returns YYYY-MM-DDTHH:mm
        // Java LocalDateTime expects YYYY-MM-DDTHH:mm:ss
        if (dateString.length === 16) {
          return dateString + ':00';
        }
        return dateString;
      };

      const start = new Date(form.startTime);
      const end = new Date(form.endTime);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

      if (durationMinutes <= 0) {
        toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
        setSubmitting(false);
        return;
      }
      
      if (start.getTime() < Date.now()) {
        toast.error("Thời gian bắt đầu phải trong tương lai!");
        setSubmitting(false);
        return;
      }

      if (form.coverImage) {
        if (form.coverImage.startsWith("data:image")) {
          toast.error("Vui lòng không dán mã Base64 dài. Hãy dùng link bắt đầu bằng http/https hoặc bấm Tải Lên.");
          setSubmitting(false);
          return;
        }
        if (form.coverImage.length > 255) {
          toast.error("Đường dẫn ảnh quá dài (tối đa 255 ký tự). Vui lòng dùng ảnh khác hoặc tải file trực tiếp lên.");
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        title: form.title,
        description: form.description,
        topicId: form.topicId,
        coverImage: form.coverImage || undefined,
        maxParticipants: form.maxParticipants,
        requiredLevel: form.requiredLevel,
        startTime: formatLocal(form.startTime),
        endTime: formatLocal(form.endTime)
      };

      if (editingSessionId) {
        await moderatorService.updateSession(editingSessionId, payload);
        toast.success("Đã cập nhật buổi học thành công!");
      } else {
        await moderatorService.createSession(payload);
        toast.success("Đã gửi yêu cầu tạo buổi học thành công (Chờ admin duyệt)!");
      }
      
      const newSessions = await moderatorService.getSessions();
      setSessions(Array.isArray(newSessions) ? newSessions : (newSessions as any)?.content || []);

      setIsCreating(false);
      setEditingSessionId(null);
      setForm({ ...form, title: "", description: "", startTime: "", endTime: "", coverImage: "" });
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e: any) => e.defaultMessage || e.msg || e.message).join(', ');
        toast.error(`Lỗi: ${errorMessages}`);
      } else {
        toast.error(err.response?.data?.message || "Lỗi khi lưu buổi học");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (session: any) => {
    const formatForInput = (dateStr: string) => {
      const d = new Date(dateStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    
    setForm({
      topicId: session.topicId || topics[0]?.id || 1,
      title: session.title,
      description: session.description || "",
      coverImage: session.coverImage || "",
      maxParticipants: session.maxParticipants,
      requiredLevel: session.requiredLevel,
      startTime: formatForInput(session.startTime),
      endTime: formatForInput(session.endTime)
    });
    setEditingSessionId(session.id);
    setIsCreating(true);
  };


  if (loading) return <LoadingSpinner size="lg" text="Đang tải dữ liệu Moderator..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 mb-2 tracking-tight drop-shadow-md">
            <span className="bg-gradient-to-br from-amber-400 via-orange-400 to-amber-600 text-transparent bg-clip-text">Moderator Dashboard</span>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
          </h1>
          <p className="text-slate-300 font-medium">Chào mừng trở lại! Bạn có <span className="text-amber-400 font-bold px-1">{sessions.length}</span> buổi học sắp diễn ra.</p>
        </div>
        
        <button
          onClick={() => {
            setEditingSessionId(null);
            setForm({ ...form, title: "", description: "", startTime: "", endTime: "", coverImage: "" });
            setIsCreating(true);
          }}
          className="btn-primary bg-amber-500 hover:bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2 px-6 text-black"
        >
          <Plus className="w-4 h-4" />
          Tạo Buổi học Mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="relative glass-panel p-6 rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
          <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-[spin_4s_linear_infinite] blur-xl pointer-events-none transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Video className="w-6 h-6 text-amber-400 drop-shadow-md" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Buổi đã dạy</p>
            </div>
            <p className="text-4xl font-black text-white drop-shadow-sm">{sessions.length}</p>
          </div>
        </div>

        <div className="relative glass-panel p-6 rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
          <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-[spin_4s_linear_infinite] blur-xl pointer-events-none transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-blue-400 drop-shadow-md" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Học viên tham gia</p>
            </div>
            <p className="text-4xl font-black text-white drop-shadow-sm">{sessions.reduce((sum, s) => sum + (s.currentParticipants || 0), 0)}</p>
          </div>
        </div>

        <div className="relative glass-panel p-6 rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
          <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-[spin_4s_linear_infinite] blur-xl pointer-events-none transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-green-400 drop-shadow-md" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Đánh giá trung bình</p>
            </div>
            <p className="text-4xl font-black text-white drop-shadow-sm">{avgRating}<span className="text-lg text-slate-400 font-medium ml-1">/ 5</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden group">
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

        <div className="glass-panel rounded-2xl relative overflow-hidden group min-h-[300px] flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-orange-900/40 to-black z-0" />
          
          <div className="absolute right-[-10%] bottom-[-10%] w-[120%] h-[120%] pointer-events-none z-0">
            <img 
              src="/moderator-welcome-bg.png" 
              alt="Moderator Illustration" 
              className="w-full h-full object-cover object-right-bottom opacity-70 animate-float-img mix-blend-screen"
            />
          </div>

          <div className="relative z-10 p-8 flex flex-col justify-center h-full w-[70%]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Star className="w-3 h-3" /> CHỈ ĐẠO
            </div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight drop-shadow-md leading-tight">Trung tâm <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">điều phối</span></h2>
            <p className="text-sm text-slate-300 mb-6 font-medium leading-relaxed drop-shadow-sm">
              Điều phối <strong className="text-white text-lg mx-1">{sessions.filter(s => s.status === "ACTIVE" || s.status === "IN_PROGRESS").length}</strong> phòng chat active hiện tại. Nhấn vào phòng để bắt đầu buổi nói chuyện.
            </p>
            <button 
              onClick={() => {
                setEditingSessionId(null);
                setForm({ ...form, title: "", description: "", startTime: "", endTime: "", coverImage: "" });
                setIsCreating(true);
              }}
              className="px-6 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:-translate-y-1 w-fit"
            >
              + Lên lịch buổi học
            </button>
          </div>
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
        {sessions.filter(s => {
          const status = s.status?.toUpperCase();
          if (activeTab === "upcoming") {
            return status === "SCHEDULED" || status === "ACTIVE" || status === "IN_PROGRESS" || status === "PENDING" || status === "PENDING_APPROVAL" || status === "APPROVED";
          } else {
            return status === "COMPLETED" || status === "ENDED" || status === "CANCELLED" || status === "CLOSED";
          }
        }).map(session => (
          <motion.div key={session.id} variants={slideIn} className="glass-panel rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold tracking-wider border border-amber-500/20 shadow-inner">
                {session.requiredLevel}
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shadow-inner">
                {session.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-amber-300 transition-colors drop-shadow-sm">
              {session.title}
            </h3>
            <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
              <p className="text-sm font-medium text-slate-300 flex items-center gap-3">
                <CalendarIcon className="w-4 h-4 flex-shrink-0 text-slate-500" /> 
                {(() => {
                  const d = new Date(session.startTime);
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
                })()}
              </p>
              <p className="text-sm font-medium text-slate-300 flex items-center gap-3">
                <Clock className="w-4 h-4 flex-shrink-0 text-slate-500" /> 
                {(() => {
                  const s = new Date(session.startTime);
                  const e = new Date(session.endTime);
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  return `${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())}`;
                })()}
              </p>
              <p className="text-sm font-medium text-slate-300 flex items-center gap-3">
                <Users className="w-4 h-4 flex-shrink-0 text-slate-500" /> {session.currentParticipants} / {session.maxParticipants} học viên
              </p>
            </div>
            <div className="mt-6 flex gap-2">
              {(() => {
                const now = new Date();
                const start = new Date(session.startTime);
                const end = new Date(session.endTime);
                
                if (now > end) {
                  return (
                    <button disabled className="flex-1 py-2 rounded-lg bg-white/5 text-muted-foreground font-medium text-sm text-center inline-block cursor-not-allowed border border-white/5">
                      Đã kết thúc
                    </button>
                  );
                } else if (now >= start && now <= end) {
                  return (
                    <Link href={`/sessions/${session.id}/room`} className="flex-1 py-2 rounded-lg bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors text-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      Vào phòng
                    </Link>
                  );
                } else {
                  return (
                    <Link href={`/sessions/${session.id}/room`} className="flex-1 py-2 rounded-lg bg-amber-500/20 text-amber-300 font-medium text-sm hover:bg-amber-500/30 transition-colors text-center shadow-sm">
                      Vào sớm (Chưa đến giờ)
                    </Link>
                  );
                }
              })()}
              
              {new Date() < new Date(session.endTime) && (
                <button 
                  onClick={() => openEditModal(session)}
                  className="px-4 py-2 rounded-lg bg-black/20 text-white font-bold text-sm hover:bg-white/10 transition-colors border border-white/10"
                >
                  Sửa
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg glass-panel rounded-2xl p-8 shadow-[0_15px_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] border border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">{editingSessionId ? "Sửa Buổi Học" : "Tạo Buổi Học Mới"}</h2>
                <button onClick={() => { setIsCreating(false); setEditingSessionId(null); }} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
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
                  <label className="text-sm font-medium text-white">Ảnh bìa (tùy chọn)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Dán địa chỉ ảnh (URL) hoặc tải lên..." 
                      value={form.coverImage} 
                      onChange={e => setForm({...form, coverImage: e.target.value})} 
                      className="ecc-input flex-1" 
                    />
                    <label className="btn-secondary px-4 py-2 rounded-xl cursor-pointer flex items-center justify-center shrink-0 bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-colors">
                      Tải lên
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await moderatorService.uploadCover(file);
                          setForm({...form, coverImage: url});
                          toast.success("Tải ảnh bìa thành công!");
                        } catch (err) {
                          toast.error("Lỗi tải ảnh bìa");
                        }
                      }} />
                    </label>
                  </div>
                  {form.coverImage && (
                    <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border border-white/10">
                      <img src={form.coverImage} alt="Cover preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
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
                  {submitting ? "Đang gửi..." : (editingSessionId ? "Cập Nhật" : "Tạo & Chờ Duyệt")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
