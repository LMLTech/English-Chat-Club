"use client";

import { useEffect, useState } from "react";
import { sessionService, SessionResponse, DiscussionTopic } from "@/features/sessions/sessionService";
import SessionCard from "@/components/shared/SessionCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { CalendarDays, Filter, Search } from "lucide-react";

const MOCK_SESSIONS: SessionResponse[] = [
  {
    id: 1,
    title: "English Pronunciation Practice - Phụ âm khó",
    description: "Luyện tập phát âm các âm khó trong tiếng Anh như /th/, /r/, /l/. Phù hợp cho người học cần cải thiện pronunciation.",
    scheduledAt: new Date(Date.now() + 3600000 * 24).toISOString(),
    durationMinutes: 60,
    maxParticipants: 10,
    currentParticipants: 7,
    cefrLevel: "B1",
    status: "SCHEDULED",
    topicName: "Phát âm",
    moderatorId: 1,
    moderatorName: "Nguyễn Thị Lan",
  },
  {
    id: 2,
    title: "Business English - Job Interview Skills",
    description: "Thực hành kỹ năng phỏng vấn tiếng Anh trong môi trường công sở. Học cách giới thiệu bản thân, trả lời câu hỏi khó.",
    scheduledAt: new Date(Date.now() + 3600000 * 48).toISOString(),
    durationMinutes: 90,
    maxParticipants: 8,
    currentParticipants: 3,
    cefrLevel: "B2",
    status: "SCHEDULED",
    topicName: "Kinh doanh",
    moderatorId: 2,
    moderatorName: "Trần Văn Minh",
  },
  {
    id: 3,
    title: "Daily Conversation - At the Restaurant",
    description: "Học cách gọi món, hỏi giá, than phiền và khen ngợi tại nhà hàng bằng tiếng Anh.",
    scheduledAt: new Date(Date.now() + 3600000 * 72).toISOString(),
    durationMinutes: 45,
    maxParticipants: 12,
    currentParticipants: 12,
    cefrLevel: "A2",
    status: "SCHEDULED",
    topicName: "Hội thoại hằng ngày",
    moderatorId: 3,
    moderatorName: "Lê Thị Hoa",
  },
  {
    id: 4,
    title: "IELTS Reading Strategies",
    description: "Các chiến thuật đọc hiểu trong kỳ thi IELTS: skimming, scanning, keyword matching.",
    scheduledAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    durationMinutes: 60,
    maxParticipants: 10,
    currentParticipants: 8,
    cefrLevel: "C1",
    status: "COMPLETED",
    topicName: "IELTS",
    moderatorId: 1,
    moderatorName: "Nguyễn Thị Lan",
  },
];

const CEFR_LEVELS = ["Tất cả", "A1", "A2", "B1", "B2", "C1", "C2"];

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>(MOCK_SESSIONS);
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookedIds, setBookedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [cefrFilter, setCefrFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("SCHEDULED");

  useEffect(() => {
    sessionService.getTopics()
      .then(setTopics)
      .catch(() => {});
  }, []);

  const handleBook = async (sessionId: number) => {
    try {
      await sessionService.bookSession(sessionId);
      setBookedIds((prev) => new Set(prev).add(sessionId));
      toast.success("Đặt chỗ thành công! 🎉");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đặt chỗ thất bại. Vui lòng thử lại!");
    }
  };

  const handleCancel = async (sessionId: number) => {
    try {
      await sessionService.cancelBooking(sessionId);
      setBookedIds((prev) => {
        const next = new Set(prev);
        next.delete(sessionId);
        return next;
      });
      toast.success("Đã hủy đặt chỗ");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Hủy đặt chỗ thất bại!");
    }
  };

  const filtered = sessions.filter((s) => {
    const matchSearch = search === "" ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCefr = cefrFilter === "Tất cả" || s.cefrLevel === cefrFilter;
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchSearch && matchCefr && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <CalendarDays className="w-6 h-6 text-blue-400" />
          Buổi học
        </h1>
        <p className="text-muted-foreground text-sm">
          Tìm và đặt chỗ cho các buổi luyện tiếng Anh phù hợp với bạn
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm buổi học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ecc-input pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* CEFR Level filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Trình độ:</span>
            <div className="flex gap-1.5 flex-wrap">
              {CEFR_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setCefrFilter(level)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    cefrFilter === level
                      ? "bg-violet-500 text-white"
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ecc-input py-1 text-xs w-auto"
            >
              <option value="ALL">Tất cả</option>
              <option value="SCHEDULED">Sắp diễn ra</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="COMPLETED">Đã kết thúc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner text="Đang tải danh sách buổi học..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Không có buổi học nào"
          description="Thử thay đổi bộ lọc hoặc tìm kiếm khác"
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{filtered.length} buổi học</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((session, idx) => (
              <div key={session.id} className={`animate-fade-in delay-${Math.min(idx * 100, 500)}`}>
                <SessionCard
                  session={session}
                  isBooked={bookedIds.has(session.id)}
                  isFull={session.currentParticipants >= session.maxParticipants && !bookedIds.has(session.id)}
                  onBook={handleBook}
                  onCancel={handleCancel}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
