"use client";

import { CalendarDays, Clock, Users, Star } from "lucide-react";
import { SessionResponse } from "@/features/sessions/sessionService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface SessionCardProps {
  session: SessionResponse;
  onBook?: (id: number) => void;
  onCancel?: (id: number) => void;
  isBooked?: boolean;
  isFull?: boolean;
}

const cefrColors: Record<string, string> = {
  A1: "text-green-400 bg-green-500/10 border-green-500/20",
  A2: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  B1: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  B2: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  C1: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  C2: "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

const statusColors: Record<string, string> = {
  SCHEDULED: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  ONGOING: "text-green-400 bg-green-500/10 border-green-500/20",
  COMPLETED: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  CANCELLED: "text-red-400 bg-red-500/10 border-red-500/20",
  PENDING_APPROVAL: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function SessionCard({ session, onBook, onCancel, isBooked, isFull }: SessionCardProps) {
  const scheduledDate = new Date(session.startTime);
  const endDate = new Date(session.endTime);
  const cefrStyle = cefrColors[session.requiredLevel] || "text-gray-400 bg-gray-500/10 border-gray-500/20";
  const statusStyle = statusColors[session.status] || "text-gray-400 bg-gray-500/10 border-gray-500/20";

  const participantPercent = Math.round((session.currentParticipants / session.maxParticipants) * 100);

  return (
    <div className="session-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-lg truncate">{session.title}</h3>
          {session.topicTitle && (
            <p className="text-xs text-muted-foreground mt-1">📌 {session.topicTitle}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
          <span className={`badge-pill border ${cefrStyle}`}>{session.requiredLevel}</span>
          <span className={`badge-pill border ${statusStyle} text-[10px]`}>
            {session.status === "SCHEDULED" ? "Sắp diễn ra" :
             session.status === "ONGOING" ? "Đang diễn ra" :
             session.status === "COMPLETED" ? "Đã kết thúc" :
             session.status === "PENDING_APPROVAL" ? "Chờ duyệt" : session.status}
          </span>
        </div>
      </div>

      {/* Description */}
      {session.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{session.description}</p>
      )}

      {/* Meta */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5 text-violet-400" />
          <span>
            {format(scheduledDate, "EEEE, dd/MM/yyyy", { locale: vi })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {format(scheduledDate, "HH:mm")} – {format(endDate, "HH:mm")}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5 text-green-400" />
          <span>{session.currentParticipants}/{session.maxParticipants} người tham gia</span>
        </div>
      </div>

      {/* Participants bar */}
      <div className="mb-4">
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${participantPercent}%`,
              background: participantPercent >= 90
                ? "linear-gradient(90deg, #f87171, #ef4444)"
                : "linear-gradient(90deg, #7c3aed, #3b82f6)"
            }}
          />
        </div>
      </div>

      {/* Moderator */}
      {session.moderatorName && (
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400" />
          Moderator: <span className="text-foreground/80">{session.moderatorName}</span>
        </p>
      )}

      {/* Actions */}
      {session.status === "SCHEDULED" && (onBook || onCancel) && (
        <div className="pt-3 border-t border-white/5">
          {isBooked ? (
            <button
              onClick={() => onCancel?.(session.id)}
              className="w-full px-4 py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              Hủy đặt chỗ
            </button>
          ) : (
            <button
              onClick={() => onBook?.(session.id)}
              className={`w-full px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isFull
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                  : "btn-primary"
              }`}
            >
              {isFull ? "Vào danh sách chờ" : "Đặt chỗ ngay"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
