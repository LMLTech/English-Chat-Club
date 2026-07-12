"use client";

import { useState, useEffect } from "react";
import { supportService, SupportTicketResponse } from "@/features/support/supportService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { MessageSquare, Headset, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { slideIn, staggerContainer } from "@/lib/utils";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketResponse | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    try {
      const data = await supportService.getTickets();
      setTickets(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tải danh sách hỗ trợ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleClose = async (uuid: string) => {
    try {
      await supportService.closeTicket(uuid);
      toast.success("Đã đóng ticket thành công");
      fetchTickets();
      if (selectedTicket?.uuid === uuid) {
        setSelectedTicket(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi đóng ticket");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setReplying(true);
    try {
      await supportService.addMessage(selectedTicket.uuid, { message: replyMessage });
      toast.success("Đã gửi phản hồi");
      setReplyMessage("");
      // Ideally fetch chat history here, but we just show success for now
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi gửi phản hồi");
    } finally {
      setReplying(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Đang tải dữ liệu hỗ trợ..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            Hỗ Trợ Khách Hàng
          </h1>
          <p className="text-sm text-muted-foreground">Quản lý và phản hồi các yêu cầu từ người dùng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h2 className="font-semibold text-white">Danh sách Ticket ({tickets.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <AnimatePresence>
              {tickets.map(ticket => (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-4 border-b border-white/5 transition-colors ${
                    selectedTicket?.id === ticket.id 
                      ? "bg-white/10 border-l-4 border-l-blue-500" 
                      : "bg-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                      {ticket.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      ticket.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/10 text-white/60 border-white/20'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white line-clamp-1">{ticket.subject}</h3>
                  <p className="text-xs text-muted-foreground mt-2 flex justify-between">
                    <span>Mức độ: <span className={ticket.priority === 'HIGH' ? 'text-rose-500' : 'text-amber-500'}>{ticket.priority}</span></span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </p>
                </motion.button>
              ))}
              {tickets.length === 0 && (
                <div className="text-center p-8 text-muted-foreground text-sm">
                  Không có yêu cầu hỗ trợ nào
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg text-white">{selectedTicket.subject}</h2>
                  <p className="text-sm text-muted-foreground">Người dùng ID: {selectedTicket.userId} • Ticket #{selectedTicket.id}</p>
                </div>
                {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                  <button 
                    onClick={() => handleClose(selectedTicket.uuid)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm border border-red-500/20"
                  >
                    <XCircle className="w-4 h-4" /> Đóng ticket
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-black/20">
                <div className="flex flex-col gap-4">
                  <div className="text-center text-muted-foreground text-sm my-4">
                    --- Bắt đầu yêu cầu hỗ trợ ---
                  </div>
                </div>
              </div>

              {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' ? (
                <form onSubmit={handleReply} className="p-4 border-t border-white/5 bg-white/5 flex gap-2">
                  <input 
                    type="text" 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..." 
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    disabled={replying}
                  />
                  <button 
                    type="submit" 
                    disabled={replying || !replyMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-white/5 bg-white/5 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Ticket này đã đóng, không thể trả lời thêm.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p>Chọn một ticket bên trái để xem chi tiết và phản hồi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
