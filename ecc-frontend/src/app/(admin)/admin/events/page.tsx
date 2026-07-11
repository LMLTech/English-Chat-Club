"use client";

import { useState } from "react";
import { adminService, AdminEventRequest } from "@/features/admin/adminService";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Activity } from "lucide-react";
import { slideIn, staggerContainer } from "@/lib/utils";

export default function AdminEventsPage() {
  const [form, setForm] = useState<AdminEventRequest>({
    title: "",
    description: "",
    pointsRequired: 0,
    rewardPoints: 100,
    startTime: "",
    endTime: ""
  });
  const [submitting, setSubmitting] = useState(false);

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
      setForm({ title: "", description: "", pointsRequired: 0, rewardPoints: 100, startTime: "", endTime: "" });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={slideIn} initial="hidden" animate="visible" className="glass-card rounded-2xl border border-white/5 p-6 relative overflow-hidden">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">Điểm yêu cầu</label>
                <input type="number" min={0} value={form.pointsRequired} onChange={e => setForm({...form, pointsRequired: Number(e.target.value)})} required className="ecc-input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">Phần thưởng (Points)</label>
                <input type="number" min={0} value={form.rewardPoints} onChange={e => setForm({...form, rewardPoints: Number(e.target.value)})} required className="ecc-input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">Thời gian bắt đầu</label>
                <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required className="ecc-input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">Thời gian kết thúc</label>
                <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required className="ecc-input" />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {submitting ? "Đang tạo..." : "Khởi tạo sự kiện"}
            </button>
          </form>
        </motion.div>

        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl mt-4">
          <CalendarDays className="w-10 h-10 text-emerald-400/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-white">Danh sách sự kiện đang được cập nhật</p>
        </div>
      </div>
    </div>
  );
}
