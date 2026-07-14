"use client";

import { useState, useEffect } from "react";
import { adminService, SupportTicket } from "@/features/admin/adminService";
import { toast } from "sonner";
import { MessageSquare, AlertCircle, CheckCircle2, Search, Send } from "lucide-react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    setLoading(true);
    adminService.getSupportTickets()
      .then(res => {
        const data = res || [];
        setTickets(data);
        if (data.length > 0 && !selectedTicket) setSelectedTicket(data[0]);
      })
      .catch(() => toast.error("Không thể tải danh sách báo cáo"))
      .finally(() => setLoading(false));
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const updatedTicket = await adminService.replySupportTicket(selectedTicket.id, replyText);
      toast.success("Đã phản hồi thành công!");
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      setReplyText("");
    } catch (err) {
      toast.error("Lỗi khi gửi phản hồi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-amber-400" />
          Hỗ trợ & Báo cáo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Xử lý các yêu cầu hỗ trợ và báo cáo từ người dùng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 glass-card rounded-2xl border border-white/5 flex flex-col h-[600px] overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Tìm kiếm ticket..." 
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 styled-scrollbar">
            {loading ? (
              <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : tickets.length === 0 ? (
              <p className="text-center text-muted-foreground p-8 text-sm">Không có báo cáo nào</p>
            ) : (
              tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedTicket?.id === ticket.id 
                      ? "bg-amber-500/10 border border-amber-500/20" 
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{ticket.id} - {ticket.userName || ticket.userEmail || `User: ${ticket.userId}`}
                    </span>
                    {ticket.status === "OPEN" ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">OPEN</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">RESOLVED</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white truncate mb-1">{ticket.subject}</h3>
                  <p className="text-xs text-muted-foreground truncate">{ticket.content}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 flex flex-col h-[600px] overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded bg-white/5 text-xs font-medium text-muted-foreground">Ticket #{selectedTicket.id}</span>
                  {selectedTicket.status === "OPEN" ? (
                    <span className="flex items-center gap-1 text-xs text-rose-400"><AlertCircle className="w-3 h-3" /> Đang chờ xử lý</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Đã giải quyết</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                <div className="text-xs text-muted-foreground mb-4">
                  Gửi bởi: <span className="text-white">{selectedTicket.userName || 'Unknown'}</span> 
                  {selectedTicket.userEmail && <span className="ml-2 text-amber-400/80">({selectedTicket.userEmail})</span>}
                </div>
                <div className="text-sm text-muted-foreground bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed">
                  {selectedTicket.content}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-black/20 styled-scrollbar">
                {selectedTicket.replyMessage ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Phản hồi của Admin</p>
                    <p className="text-sm text-amber-100/90 whitespace-pre-wrap">{selectedTicket.replyMessage}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm">Chưa có phản hồi nào. Vui lòng nhập nội dung bên dưới.</p>
                  </div>
                )}
              </div>

              {selectedTicket.status === "OPEN" && (
                <div className="p-4 border-t border-white/5 bg-[#12141c]">
                  <div className="relative">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi cho member..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-amber-500 resize-none min-h-[80px]"
                    />
                    <button
                      onClick={handleReply}
                      disabled={isSubmitting || !replyText.trim()}
                      className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center text-white transition-colors shadow-lg shadow-amber-500/20"
                    >
                      {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4 ml-[-2px]" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>Chọn một báo cáo để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
