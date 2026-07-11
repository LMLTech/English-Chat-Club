"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { communityService, DirectMessageResponse } from "@/features/community/communityService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { ArrowLeft, Send, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

export default function ChatPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!friendId) return;
    communityService.getChatHistory(parseInt(friendId))
      .then((data) => {
        // Messages come in DESC order, reverse for display
        setMessages([...(data.content || [])].reverse());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [friendId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    // In a real app, this would use WebSocket
    // For now, show a toast about WebSocket
    toast.info("WebSocket chat sẽ được kích hoạt khi backend chạy!");
    // Optimistic update
    const newMsg: DirectMessageResponse = {
      id: Date.now(),
      senderId: user?.userId || 0,
      senderName: user?.fullName || "Bạn",
      receiverId: parseInt(friendId),
      content: text,
      recalled: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setText("");
  };

  const handleRecall = async (messageId: number) => {
    try {
      await communityService.recallMessage(messageId);
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, recalled: true, content: "Tin nhắn đã được thu hồi" } : m)
      );
    } catch {
      toast.error("Không thể thu hồi tin nhắn!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-7rem)] flex flex-col animate-fade-in">
      {/* Chat Header */}
      <div className="glass-card rounded-xl p-4 mb-4 flex items-center gap-3 flex-shrink-0">
        <Link href="/messages" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/60 to-cyan-500/60 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          U
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Người dùng #{friendId}</p>
          <p className="text-xs text-muted-foreground">Tin nhắn riêng</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto glass-card rounded-xl p-4 mb-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Send className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.userId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/60 to-blue-500/60 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mr-2 mt-auto">
                    U
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-br-sm"
                    : "bg-white/8 border border-white/10 text-foreground rounded-bl-sm"
                } ${msg.recalled ? "opacity-50 italic" : ""}`}>
                  <p className="text-sm">{msg.recalled ? "Tin nhắn đã bị thu hồi" : msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <p className={`text-[10px] ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </p>
                    {isMe && !msg.recalled && (
                      <button
                        onClick={() => handleRecall(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                        title="Thu hồi tin nhắn"
                      >
                        <RotateCcw className="w-3 h-3 text-white/60 hover:text-white/90" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-card rounded-xl p-3 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="ecc-input flex-1"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
