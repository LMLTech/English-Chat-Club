"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { communityService, DirectMessageResponse } from "@/features/community/communityService";
import { profileService, UserProfileResponse } from "@/features/profile/profileService";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Phone, Video, MoreVertical, Paperclip, 
  Smile, Image as ImageIcon, Check, CheckCheck, Mic, X
} from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function ChatRoomPage() {
  const params = useParams();
  const friendId = Number(params.friendId);
  const { user, accessToken } = useAuthStore();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendProfile, setFriendProfile] = useState<UserProfileResponse | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordInterval = useRef<NodeJS.Timeout | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    communityService.getChatHistory(friendId, { page: 0, size: 50 })
      .then(data => {
        const msgs = data.content || data || [];
        // Sort ascending by time for display
        setMessages(msgs.reverse());
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    profileService.getProfileById(friendId)
      .then(setFriendProfile)
      .catch(console.error);

    // Connect WebSocket
    if (!accessToken || !user?.userId) return;
    
    let isMounted = true;
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`
      },
      debug: function (str) {
        // console.log(str);
      },
      onConnect: () => {
        if (!isMounted) {
          client.deactivate();
          return;
        }
        console.log("Connected to STOMP WebSocket");
        // Subscribe to direct messages queue
        client.subscribe(`/user/queue/direct`, (message) => {
          if (message.body) {
            const parsedMsg = JSON.parse(message.body);
            // Only add if it's from this friend
            if (parsedMsg.senderId === friendId || parsedMsg.receiverId === friendId) {
              setMessages(prev => {
                if (prev.some(m => m.id === parsedMsg.id)) return prev;
                return [...prev, parsedMsg];
              });
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      }
    });

    if (isMounted) {
      client.activate();
      stompClientRef.current = client;
    }

    return () => {
      isMounted = false;
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [friendId, user?.userId, accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e?: React.FormEvent, type: "text" | "image" | "voice" = "text", content: string = "") => {
    if (e) e.preventDefault();
    
    let msgContent = type === "text" ? newMessage.trim() : content;
    if (!msgContent && type === "text") return;

    // Send to backend via STOMP
    if (stompClientRef.current?.active) {
      const chatMessage = {
        content: msgContent,
        attachmentUrl: type === "text" ? null : msgContent, // Assuming content holds URL if not text
        type: type
      };
      
      stompClientRef.current.publish({
        destination: `/app/direct/${friendId}`,
        body: JSON.stringify(chatMessage)
      });
      
      // Optimistically add to UI, but note that the real id will come back from WebSocket 
      // if the server bounces it back. For now, let's just wait for the websocket broadcast if possible.
      // Actually, since it's a 1-1 chat, the backend might only send to the receiver. Let's check backend:
      // "isReceiverOnline = true -> convertAndSendToUser" - It does NOT send back to the sender!
      // So we MUST add it to UI locally.
      
      const newMsg = {
        id: Date.now(), // Temporary ID
        senderId: user?.userId || 999,
        receiverId: friendId,
        content: msgContent,
        type: type,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
      
    } else {
      toast.error("Chưa kết nối đến máy chủ Chat!");
    }

    if (type === "text") setNewMessage("");
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordTime(0);
    recordInterval.current = setInterval(() => {
      setRecordTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = (send: boolean) => {
    setIsRecording(false);
    if (recordInterval.current) clearInterval(recordInterval.current);
    if (send && recordTime > 0) {
      handleSend(undefined, "voice", `[Voice message: ${Math.floor(recordTime/60)}:${(recordTime%60).toString().padStart(2, '0')}]`);
      toast.success("Đã gửi tin nhắn thoại");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleSend(undefined, "image", event.target?.result as string);
        toast.success("Đã gửi hình ảnh");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCall = (type: "voice" | "video") => {
    toast("Tính năng đang phát triển", {
      description: `Sẽ sớm hỗ trợ ${type === 'video' ? 'gọi Video' : 'gọi điện'}!`,
      icon: type === 'video' ? <Video className="w-4 h-4 text-emerald-400"/> : <Phone className="w-4 h-4 text-emerald-400"/>
    });
  };

  if (loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner text="Đang kết nối..." /></div>;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] relative overflow-hidden">
      {/* Chat Header */}
      <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl px-6 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={friendProfile?.avatarUrl || `https://i.pravatar.cc/150?u=${friendId}`} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-lg border border-white/10" />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{friendProfile?.fullName || `Người dùng #${friendId}`}</h2>
            <p className="text-[11px] text-emerald-400 font-medium">Đang trực tuyến</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => handleCall('voice')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button onClick={() => handleCall('video')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
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
              <img src={friendProfile?.avatarUrl || `https://i.pravatar.cc/150?u=${friendId}`} alt="Avatar" className="w-full h-full rounded-full object-cover shadow-2xl shadow-violet-500/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Đây là khởi đầu của cuộc trò chuyện.</h3>
            <p className="text-sm text-muted-foreground">Gửi lời chào đến {friendProfile?.fullName || `Người dùng #${friendId}`} ngay nào!</p>
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
                      <img src={friendProfile?.avatarUrl || `https://i.pravatar.cc/150?u=${friendId}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={cn(
                    "relative px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    isMe 
                      ? "bg-violet-600 text-white rounded-tr-sm shadow-[0_4px_20px_rgba(124,58,237,0.2)]" 
                      : "bg-[#1e1f29] border border-white/5 text-white/90 rounded-tl-sm"
                  )}>
                    {msg.type === 'image' ? (
                      <img src={msg.content} alt="MMS" className="rounded-lg max-w-full max-h-64 object-cover" />
                    ) : msg.type === 'voice' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                        <div className="h-2 w-24 bg-white/20 rounded-full overflow-hidden flex items-center px-1">
                           <div className="h-1 w-full bg-white/60 rounded-full"></div>
                        </div>
                        <span className="text-xs font-mono">{msg.content.replace('[Voice message: ', '').replace(']', '')}</span>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
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
          {isRecording ? (
            <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-2xl p-4 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-red-400 font-mono font-medium">
                  {Math.floor(recordTime/60)}:{(recordTime%60).toString().padStart(2, '0')}
                </span>
                <span className="text-sm text-red-400/80">Đang ghi âm...</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => stopRecording(false)} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => stopRecording(true)} className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/20">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-[#1a1b26] rounded-2xl border border-white/10 p-2 shadow-inner focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all">
            <div className="flex gap-1 pb-1">
              <button type="button" onClick={() => document.getElementById('chat-file-upload')?.click()} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                <Paperclip className="w-4 h-4" />
                <input type="file" id="chat-file-upload" className="hidden" />
              </button>
              <button type="button" onClick={() => document.getElementById('chat-img-upload')?.click()} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors hidden sm:flex">
                <ImageIcon className="w-4 h-4" />
                <input type="file" accept="image/*" id="chat-img-upload" className="hidden" onChange={handleImageUpload} />
              </button>
            </div>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={`Nhắn tin cho ${friendProfile?.fullName || `Người dùng #${friendId}`}...`}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-muted-foreground outline-none py-3"
            />

            <div className="flex gap-1 pb-1">
              {newMessage.trim() === "" ? (
                <button type="button" onClick={startRecording} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center transition-colors ml-1">
                  <Mic className="w-4 h-4 ml-0.5" />
                </button>
              ) : (
                <button 
                  type="submit"
                  className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-colors ml-1 shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              )}
            </div>
          </form>
          )}
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
