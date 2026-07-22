"use client";

import { useEffect, useState } from "react";
import { communityService, EventResponse } from "@/features/community/communityService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { CalendarDays, Clock, Trophy, Ticket } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function EventsPage() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<number[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [data, myRegistrations] = await Promise.all([
        communityService.getPublicEvents(),
        communityService.getMyEventRegistrations().catch(() => [])
      ]);
      // Filter out only active and upcoming events (status OPEN or ONGOING)
      const visibleEvents = data.filter(e => e.status !== "CANCELLED");
      setEvents(visibleEvents);
      setRegisteredEventIds(myRegistrations || []);
    } catch {
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number) => {
    setRegisteringId(eventId);
    try {
      await communityService.registerForEvent(eventId);
      toast.success("Đăng ký tham gia thành công!");
      setRegisteredEventIds(prev => [...prev, eventId]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi đăng ký tham gia");
    } finally {
      setRegisteringId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UPCOMING": return <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">SẮP DIỄN RA</span>;
      case "ONGOING": return <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">ĐANG DIỄN RA</span>;
      case "COMPLETED": return <span className="px-2 py-1 rounded text-[10px] font-bold bg-white/10 text-muted-foreground border border-white/20">ĐÃ KẾT THÚC</span>;
      default: return <span className="px-2 py-1 rounded text-[10px] font-bold bg-white/10 text-muted-foreground border border-white/20">{status}</span>;
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Đang tải sự kiện..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <CalendarDays className="w-8 h-8 text-rose-400" />
          Sự kiện & Hội thảo
        </h1>
        <p className="text-muted-foreground">Khám phá và tham gia các sự kiện tiếng Anh hấp dẫn để tích lũy điểm thưởng</p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Không có sự kiện nào"
          description="Hiện tại chưa có sự kiện nào sắp diễn ra. Vui lòng quay lại sau!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, idx) => (
            <div 
              key={event.id}
              className={`glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all duration-300 animate-fade-in flex flex-col group delay-${Math.min(idx * 100, 500)}`}
            >
              {/* Image Header */}
              <div className="relative h-48 bg-black/40 overflow-hidden">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-500/20 to-purple-500/20 group-hover:scale-105 transition-transform duration-500 ${event.imageUrl ? 'hidden' : ''}`}>
                  <CalendarDays className="w-12 h-12 text-white/30" />
                  <span className="text-white/20 text-xs mt-2 font-medium px-4 text-center">{event.title}</span>
                </div>
                <div className="absolute top-3 left-3">
                  {getStatusBadge(event.status)}
                </div>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-xl">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400">+{event.rewardPoints} đ</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-rose-300 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {event.description}
                </p>

                <div className="space-y-2 mb-5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-start gap-2 text-xs text-foreground/80">
                    <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div className="flex flex-col space-y-1">
                      <span>Bắt đầu: {format(new Date(event.startTime), "dd/MM/yyyy - HH:mm", { locale: vi })}</span>
                      <span>Kết thúc: {format(new Date(event.endTime), "dd/MM/yyyy - HH:mm", { locale: vi })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/80">
                    <Ticket className="w-4 h-4 text-rose-400" />
                    <span>Điều kiện: {event.pointsRequired} điểm</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRegister(event.id)}
                  disabled={event.status === "COMPLETED" || registeringId === event.id || registeredEventIds.includes(event.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    event.status === "COMPLETED" 
                      ? "bg-white/5 text-muted-foreground cursor-not-allowed" 
                      : registeredEventIds.includes(event.id)
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                      : "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                  }`}
                >
                  {registeringId === event.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : event.status === "COMPLETED" ? (
                    "Đã kết thúc"
                  ) : registeredEventIds.includes(event.id) ? (
                    "Đã đăng ký tham gia"
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      Đăng ký tham gia
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
