"use client";

import { useEffect, useState } from "react";
import { supportService, SupportTicketResponse } from "@/features/support/supportService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle2, ChevronRight, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, slideIn, fadeIn, cn } from "@/lib/utils";

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // New ticket form
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("TECHNICAL");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await supportService.getTickets();
      setTickets(data || []);
    } catch {
      toast.error("Không thể tải danh sách yêu cầu hỗ trợ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      await supportService.createTicket({ subject, category, content: message });
      toast.success("Đã gửi yêu cầu hỗ trợ thành công!");
      setIsCreating(false);
      setSubject("");
      setMessage("");
      loadTickets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gửi yêu cầu thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN": return <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">ĐANG MỞ</span>;
      case "IN_PROGRESS": return <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">ĐANG XỬ LÝ</span>;
      case "RESOLVED": return <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">ĐÃ GIẢI QUYẾT</span>;
      case "CLOSED": return <span className="px-2 py-1 rounded text-[10px] font-bold bg-white/10 text-muted-foreground border border-white/20">ĐÃ ĐÓNG</span>;
      default: return <span className="px-2 py-1 rounded text-[10px] font-bold bg-white/10 text-muted-foreground border border-white/20">{status}</span>;
    }
  };

  if (loading && tickets.length === 0) return <LoadingSpinner size="lg" text="Đang tải dữ liệu hỗ trợ..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
            <LifeBuoy className="w-6 h-6 text-violet-400" />
            Trung tâm hỗ trợ
          </h1>
          <p className="text-sm text-muted-foreground">Gửi yêu cầu hỗ trợ hoặc theo dõi các ticket của bạn</p>
        </div>
        
        {!isCreating && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <Plus className="w-4 h-4" />
            Tạo Ticket Mới
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            key="create-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-2xl p-6 border border-white/10 overflow-hidden"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Gửi yêu cầu hỗ trợ mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-foreground/80">Tiêu đề</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Tóm tắt vấn đề của bạn..."
                    className="ecc-input"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Phân loại</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="ecc-input"
                  >
                    <option className="text-black" value="TECHNICAL">Lỗi Kỹ Thuật (App/Web)</option>
                    <option className="text-black" value="ACCOUNT">Tài khoản & Đăng nhập</option>
                    <option className="text-black" value="PAYMENT">Thanh toán & Điểm thưởng</option>
                    <option className="text-black" value="REPORT">Báo cáo vi phạm</option>
                    <option className="text-black" value="OTHER">Khác</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-foreground/80">Nội dung chi tiết</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                    className="ecc-input resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm text-foreground hover:bg-white/5 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="ticket-list"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {tickets.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Chưa có yêu cầu hỗ trợ"
                description="Bạn chưa tạo ticket hỗ trợ nào. Nếu gặp vấn đề, hãy tạo ticket mới."
              />
            ) : (
              tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  variants={slideIn}
                  className="glass-card rounded-xl border border-white/5 hover:border-white/10 transition-all overflow-hidden"
                >
                  <div 
                    onClick={() => setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:bg-white/[0.03]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-muted-foreground">#{ticket.id}</span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <h3 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <LifeBuoy className="w-3.5 h-3.5" />
                          {ticket.category}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(ticket.updatedAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 transition-colors">
                      <ChevronRight className={cn("w-5 h-5 transition-transform", expandedTicketId === ticket.id ? "rotate-90" : "")} />
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedTicketId === ticket.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-white/[0.02]"
                      >
                        <div className="p-5 space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Nội dung yêu cầu</p>
                            <div className="p-3 rounded-lg bg-black/20 text-sm text-white/90 whitespace-pre-wrap border border-white/5">
                              {ticket.content}
                            </div>
                          </div>
                          
                          {ticket.replyMessage && (
                            <div>
                              <p className="text-xs text-emerald-400 mb-1 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Phản hồi từ Admin
                              </p>
                              <div className="p-3 rounded-lg bg-emerald-500/10 text-sm text-emerald-100/90 whitespace-pre-wrap border border-emerald-500/20">
                                {ticket.replyMessage}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
