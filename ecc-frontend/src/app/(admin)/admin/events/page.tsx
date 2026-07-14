"use client";

import { useState, useEffect } from "react";
import { adminService, AdminEventRequest, AdminEventResponse } from "@/features/admin/adminService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Plus, Activity, Trophy, Image as ImageIcon } from "lucide-react";
import { slideIn, staggerContainer, scaleUp } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<AdminEventRequest>({
    title: "",
    description: "",
    pointsRequired: 0,
    rewardPoints: 100,
    imageUrl: "",
    startTime: "",
    endTime: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await adminService.getEvents();
      setEvents(data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createEvent({
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString()
      });
      toast.success("Tạo sự kiện thành công!");
      setForm({ title: "", description: "", imageUrl: "", pointsRequired: 0, rewardPoints: 100, startTime: "", endTime: "" });
      fetchEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo sự kiện");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-emerald-400" />
          Quản lý Sự kiện
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Tạo và quản lý các sự kiện đua top, thử thách</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div variants={slideIn} initial="hidden" animate="visible" className="xl:col-span-1 glass-card rounded-2xl border border-white/5 p-6 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <Plus className="w-5 h-5 text-emerald-400" />
            Tạo Sự Kiện Mới
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Tên sự kiện</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="ecc-input" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Mô tả chi tiết</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required className="ecc-input resize-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Hình ảnh đại diện (Tùy chọn)</label>
              <div className="flex items-center gap-3">
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="Preview" className="h-10 w-10 object-cover rounded-md border border-white/10" />
                )}
                <button type="button" onClick={() => document.getElementById('event-img-upload')?.click()} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> {form.imageUrl ? 'Thay ảnh khác' : 'Tải ảnh lên'}
                </button>
                <input 
                  type="file" 
                  id="event-img-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setForm({...form, imageUrl: URL.createObjectURL(file)});
                      toast.success("Đã tải ảnh lên (Demo)");
                    }
                  }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">Điểm yêu cầu</label>
                <input type="number" min={0} value={form.pointsRequired} onChange={e => setForm({...form, pointsRequired: Number(e.target.value)})} required className="ecc-input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">Thưởng (Points)</label>
                <input type="number" min={0} value={form.rewardPoints} onChange={e => setForm({...form, rewardPoints: Number(e.target.value)})} required className="ecc-input" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Thời gian bắt đầu</label>
              <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required className="ecc-input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Thời gian kết thúc</label>
              <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required className="ecc-input" />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {submitting ? "Đang tạo..." : "Khởi tạo sự kiện"}
            </button>
          </form>
        </motion.div>

        <div className="xl:col-span-2">
          {loading ? (
            <div className="py-20"><LoadingSpinner size="lg" text="Đang tải danh sách sự kiện..." /></div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
              <CalendarDays className="w-12 h-12 text-emerald-400/50 mx-auto mb-3" />
              <p className="text-base font-medium text-white">Chưa có sự kiện nào</p>
              <p className="text-sm text-muted-foreground mt-1">Hãy tạo một sự kiện mới để bắt đầu</p>
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <motion.div key={event.id} variants={scaleUp} className="glass-card p-5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-muted-foreground">#{event.id}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      event.status === 'UPCOMING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      event.status === 'ONGOING' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-white/5 text-muted-foreground border-white/10'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  {event.imageUrl && (
                    <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-black/40 border border-white/5">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }} 
                      />
                    </div>
                  )}
                  <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{event.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-black/20 rounded-lg p-2 border border-white/5 text-center flex flex-col justify-center">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">Yêu cầu</p>
                      <p className="text-sm font-bold text-white">{event.pointsRequired} pt</p>
                    </div>
                    <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20 text-center flex flex-col justify-center">
                      <p className="text-[10px] text-emerald-400 uppercase mb-1">Thưởng</p>
                      <p className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-1">
                        <Trophy className="w-3 h-3" /> {event.rewardPoints}
                      </p>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20 text-center flex flex-col justify-center">
                      <p className="text-[10px] text-blue-400 uppercase mb-1">Đăng ký</p>
                      <p className="text-sm font-bold text-blue-300">
                        {event.registeredCount || 0} người
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-4 border-t border-white/5">
                    <p className="text-xs text-muted-foreground flex justify-between">
                      <span>Bắt đầu:</span> <span className="text-white">{new Date(event.startTime).toLocaleString('vi-VN')}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex justify-between">
                      <span>Kết thúc:</span> <span className="text-white">{new Date(event.endTime).toLocaleString('vi-VN')}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
