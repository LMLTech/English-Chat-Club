"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/adminService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { slideIn, staggerContainer } from "@/lib/utils";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getPendingSessions()
      .then(setSessions)
      .catch(() => toast.error("Không thể tải danh sách session chờ duyệt"))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try {
      await adminService.approveSession(id);
      toast.success("Đã duyệt Session thành công!");
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      toast.error("Lỗi khi duyệt session");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          Duyệt Session Mới
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Kiểm duyệt các phòng học do Moderator yêu cầu tạo</p>
      </div>

      {sessions.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 opacity-50 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Tất cả đã được xử lý</h2>
          <p className="text-muted-foreground">Không còn session nào đang chờ duyệt lúc này.</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {sessions.map(session => (
              <motion.div 
                key={session.id} 
                variants={slideIn} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-3">
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Chờ duyệt
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{session.title}</h3>
                  <p className="text-sm text-amber-200/60 mb-4">{session.moderatorName}</p>
                  
                  <div className="space-y-1.5 mb-6">
                    <p className="text-xs text-muted-foreground">Thời gian: <span className="text-white">{session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : ''}</span></p>
                    <p className="text-xs text-muted-foreground">Trình độ: <span className="text-white font-bold">{session.cefrLevel}</span></p>
                  </div>

                  <button 
                    onClick={() => handleApprove(session.id)}
                    disabled={approvingId === session.id}
                    className="w-full py-2.5 rounded-lg bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50"
                  >
                    {approvingId === session.id ? "Đang xử lý..." : "Chấp thuận mở phòng"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
