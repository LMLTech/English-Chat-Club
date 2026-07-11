"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { communityService, DirectMessageResponse } from "@/features/community/communityService";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Phone, Video, MoreVertical, Paperclip, 
  Smile, Image as ImageIcon, Check, CheckCheck 
} from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";

// Mock messages for UI demonstration
const MOCK_MESSAGES = [
  { id: 1, senderId: 1, text: "Hi there! How are you?", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, senderId: 'me', text: "I'm doing great, thanks for asking! Are we still on for the practice session later?", createdAt: new Date(Date.now() - 3500000).toISOString() },
  { id: 3, senderId: 1, text: "Yes, definitely. I've prepared some IELTS Speaking Part 2 topics for us to go through.", createdAt: new Date(Date.now() - 3400000).toISOString() },
  { id: 4, senderId: 'me', text: "Awesome! I'll share a Google Doc with some vocabulary notes I made.", createdAt: new Date(Date.now() - 3300000).toISOString() },
  { id: 5, senderId: 1, text: "Perfect. See you in an hour!", createdAt: new Date(Date.now() - 50000).toISOString() },
];

export default function ChatRoomPage() {
  const params = useParams();
  const friendId = Number(params.friendId);
  const { user } = useAuthStore();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real app, fetch messages
    setTimeout(() => {
      setMessages(MOCK_MESSAGES.map(m => ({
        ...m,
        senderId: m.senderId === 'me' ? user?.userId || 999 : friendId
      })));
      setLoading(false);
    }, 500);
  }, [friendId, user?.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      senderId: user?.userId || 999,
      text: newMessage,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");

    // Mock auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        senderId: friendId,
        text: "I received your message!",
        createdAt: new Date().toISOString()
      }]);
    }, 1500);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner text="Đang kết nối..." /></div>;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] relative overflow-hidden">
      {/* Chat Header */}
      <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl px-6 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={`https://i.pravatar.cc/150?u=${friendId}`} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-lg border border-white/10" />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Người dùng #{friendId}</h2>
            <p className="text-[11px] text-emerald-400 font-medium">Đang trực tuyến</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {/* Welcome section */}
          <div className="text-center my-8">
            <div className="w-24 h-24 mx-auto rounded-full mb-4">
              <img src={`https://i.pravatar.cc/150?u=${friendId}`} alt="Avatar" className="w-full h-full rounded-full object-cover shadow-2xl shadow-violet-500/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Đây là khởi đầu của cuộc trò chuyện.</h3>
            <p className="text-sm text-muted-foreground">Gửi lời chào đến Người dùng #{friendId} ngay nào!</p>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isMe = msg.senderId === (user?.userId || 999);
              const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  layout
                  className={cn("flex gap-3 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}
                >
                  {/* Avatar */}
                  <div className="w-8 flex-shrink-0">
                    {showAvatar && !isMe && (
                      <img src={`https://i.pravatar.cc/150?u=${friendId}`} alt="Avatar" className="w-8 h-8 rounded-full" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={cn(
                    "relative px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    isMe 
                      ? "bg-violet-600 text-white rounded-tr-sm shadow-[0_4px_20px_rgba(124,58,237,0.2)]" 
                      : "bg-[#1e1f29] border border-white/5 text-white/90 rounded-tl-sm"
                  )}>
                    <p>{msg.text}</p>
                    <div className={cn("flex items-center gap-1 mt-1.5 text-[10px] opacity-70", isMe ? "justify-end text-violet-200" : "text-muted-foreground")}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/50 backdrop-blur-xl border-t border-white/5 z-10">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-[#1a1b26] rounded-2xl border border-white/10 p-2 shadow-inner focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all">
            <div className="flex gap-1 pb-1">
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors hidden sm:flex">
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
            
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={`Nhắn tin cho Người dùng #${friendId}...`}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white resize-none max-h-32 min-h-[40px] py-3 px-2 outline-none"
              rows={1}
            />

            <div className="flex gap-1 pb-1">
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                <Smile className="w-4 h-4" />
              </button>
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 disabled:text-white/20 text-white flex items-center justify-center transition-colors ml-1 shadow-[0_0_15px_rgba(124,58,237,0.4)] disabled:shadow-none"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">
              Nhấn <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">Enter</kbd> để gửi, <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">Shift + Enter</kbd> để xuống dòng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
