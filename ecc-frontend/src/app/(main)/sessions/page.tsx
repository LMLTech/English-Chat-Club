"use client";

import { useEffect, useState } from "react";
import { sessionService, SessionResponse, DiscussionTopic } from "@/features/sessions/sessionService";
import SessionCard from "@/components/shared/SessionCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { CalendarDays, Filter, Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const CEFR_LEVELS = [
  { value: "Tất cả", label: "Tất cả" },
  { value: "A1", label: "A1 (Sơ cấp)" },
  { value: "A2", label: "A2 (Cơ bản)" },
  { value: "B1", label: "B1 (Trung cấp)" },
  { value: "B2", label: "B2 (Trung cao)" },
  { value: "C1", label: "C1 (Cao cấp)" },
  { value: "C2", label: "C2 (Thành thạo)" },
];

export default function SessionsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedIds, setBookedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [cefrFilter, setCefrFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [topicFilter, setTopicFilter] = useState("ALL");

  useEffect(() => {
    Promise.all([
      sessionService.getTopics(),
      sessionService.getSessions()
    ]).then(([topicsData, sessionsData]) => {
      setTopics(topicsData);
      setSessions(Array.isArray(sessionsData) ? sessionsData : (sessionsData?.content || []));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (sessionId: number) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt chỗ!");
      router.push("/login");
      return;
    }

    try {
      await sessionService.bookSession(sessionId);
      setBookedIds((prev) => new Set(prev).add(sessionId));
      
      const session = sessions.find(s => s.id === sessionId);
      if (session && session.currentParticipants >= session.maxParticipants) {
        toast.success("Phòng đã đầy. Bạn đã được xếp vào Danh sách chờ!");
      } else {
        toast.success("Đặt chỗ thành công! 🎉");
      }
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
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.topicTitle?.toLowerCase().includes(search.toLowerCase());
    const matchCefr = cefrFilter === "Tất cả" || s.requiredLevel === cefrFilter;
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchTopic = topicFilter === "ALL" || s.topicTitle === topicFilter;
    return matchSearch && matchCefr && matchStatus && matchTopic;
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
                  key={level.value}
                  onClick={() => setCefrFilter(level.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    cefrFilter === level.value
                      ? "bg-violet-500 text-white"
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic filter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Chủ đề:</span>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="ecc-input py-1 text-xs w-auto"
            >
              <option value="ALL">Tất cả chủ đề</option>
              {topics.map(t => (
                <option key={t.id} value={t.title}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
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
