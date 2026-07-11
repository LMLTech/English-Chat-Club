"use client";

import { useEffect, useState } from "react";
import { communityService, DirectMessageResponse } from "@/features/community/communityService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { MessageCircle, Send, Users, RotateCcw } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Messages index page - show friend list to start chatting
export default function MessagesPage() {
  const [friendIds, setFriendIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityService.getFriends()
      .then(setFriendIds)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Đang tải tin nhắn..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <MessageCircle className="w-6 h-6 text-blue-400" />
          Tin nhắn
        </h1>
        <p className="text-muted-foreground text-sm">Nhắn tin riêng với bạn bè của bạn</p>
      </div>

      {friendIds.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có bạn bè"
          description="Hãy kết bạn với các thành viên khác để bắt đầu nhắn tin!"
        />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h2 className="text-sm font-semibold text-foreground">Chọn người để nhắn tin</h2>
          </div>
          <div className="divide-y divide-white/5">
            {friendIds.map((id) => (
              <a
                key={id}
                href={`/messages/${id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/60 to-cyan-500/60 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  U
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Người dùng #{id}</p>
                  <p className="text-xs text-muted-foreground">Nhấn để nhắn tin</p>
                </div>
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
