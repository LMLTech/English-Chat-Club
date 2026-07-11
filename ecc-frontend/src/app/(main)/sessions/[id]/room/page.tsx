"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { sessionService, SessionResponse } from "@/features/sessions/sessionService";
import { moderatorService } from "@/features/moderator/moderatorService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, MessageSquare, Users, Settings, LogOut, PhoneOff, Hand, Share, Smile, MoreVertical, Disc, ShieldAlert, BookPlus, Send, Star, BookOpen } from "lucide-react";

export default function SessionRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Controls
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [recording, setRecording] = useState(false);
  
  // Sidebars
  const [activeSidebar, setActiveSidebar] = useState<"chat" | "users" | "vocab" | null>("chat");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tham gia phòng học!");
      router.push("/login");
      return;
    }

    sessionService.getSessionById(Number(params.id))
      .then((data) => {
        setSession(data);
      })
      .catch((err) => {
        toast.error("Không thể tải thông tin phòng học!");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id, user, router]);

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  // If redirecting, don't render room UI
  if (!user) return null;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sessionService.submitReview(Number(params.id), {
        moderatorRating: 5,
        topicRating: 5,
        comment: "Great session!"
      });
      toast.success("Cảm ơn bạn đã đánh giá!");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Không thể gửi đánh giá");
    }
  };

  // Moderator API functions
  const handleWarnUser = async (userId: number) => {
    const reason = prompt("Lý do cảnh cáo người dùng này:");
    if (!reason) return;
    try {
      await moderatorService.warnUser({ userId, sessionId: Number(params.id), reason });
      toast.success("Đã ghi nhận cảnh cáo");
    } catch (err) {
      toast.error("Không thể cảnh cáo");
    }
  };

  const handleAddVocab = async () => {
    const word = prompt("Từ vựng mới (Tiếng Anh):");
    const meaning = prompt("Nghĩa tiếng Việt:");
    if (!word || !meaning) return;
    try {
      await moderatorService.addVocabulary({ sessionId: Number(params.id), userId: user?.userId || 0, word, meaning });
      toast.success("Đã thêm từ vựng mới vào hệ thống");
    } catch (err) {
      toast.error("Lỗi thêm từ vựng");
    }
  };

  const handleLeave = () => {
    if (user?.role === "MEMBER") {
      setReviewModalOpen(true);
    } else {
      setSummaryModalOpen(true);
    }
  };

  const submitSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await moderatorService.submitSummary(Number(params.id), { content: summaryText });
      toast.success("Đã nộp báo cáo buổi học!");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Không thể gửi báo cáo");
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Đang tham gia phòng học..." />;

  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";

  return (
    <div className="fixed inset-0 z-50 bg-[#0f111a] flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-black/40 backdrop-blur-md px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
            {session?.cefrLevel}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">{session?.title}</h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {session?.currentParticipants}/{session?.maxParticipants}
              </span>
              <span>•</span>
              <span className="text-emerald-400">Đang diễn ra</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {recording && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              REC
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid (Mock) */}
        <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
          {/* Main Speaker / You */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center group">
            {videoOn ? (
              <img src={user?.avatarUrl || "https://i.pravatar.cc/500?img=1"} alt="You" className="w-full h-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-violet-500/20 flex items-center justify-center text-4xl text-violet-400 border border-violet-500/30">
                {user?.fullName?.[0] || "U"}
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-xs font-medium text-white flex items-center gap-2">
                Bạn {!micOn && <MicOff className="w-3.5 h-3.5 text-red-400" />}
              </span>
              {handRaised && (
                <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <Hand className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>

              {/* Other Participants */}
          {[2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="relative rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center group/user">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-xl text-white/40">
                U{i}
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-medium text-white">
                  User {i}
                </span>
              </div>
              {isModerator && (
                <div className="absolute top-2 right-2 opacity-0 group-hover/user:opacity-100 transition-opacity">
                  <button onClick={() => handleWarnUser(i)} className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Panel */}
        <AnimatePresence>
          {activeSidebar && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/5 bg-[#141620] flex flex-col"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {activeSidebar === "chat" ? "Thảo luận" : activeSidebar === "users" ? "Người tham gia" : "Từ vựng nổi bật"}
                </h3>
              </div>
              
              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {activeSidebar === "chat" && (
                  <>
                    <div className="text-xs text-center text-muted-foreground my-4">Phòng chat đã được mã hóa</div>
                    {/* Message bubbles mock */}
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-3 max-w-[85%] border border-white/5">
                      <p className="text-[10px] text-violet-400 mb-1 font-bold">Teacher Alex</p>
                      <p className="text-sm text-white/90">Hello everyone! Let's start by introducing yourselves.</p>
                    </div>
                  </>
                )}

                {activeSidebar === "vocab" && isModerator && (
                  <button onClick={handleAddVocab} className="btn-ghost border border-white/10 border-dashed py-4 text-xs text-muted-foreground hover:text-white hover:border-white/30 transition-colors">
                    + Thêm từ vựng mới
                  </button>
                )}
              </div>

              {activeSidebar === "chat" && (
                <div className="p-4 border-t border-white/5">
                  <input 
                    type="text" 
                    placeholder="Nhập tin nhắn..." 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <footer className="h-20 border-t border-white/5 bg-black/40 backdrop-blur-md px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground font-mono">{new Date().toLocaleTimeString()}</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMicOn(!micOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              micOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            }`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setVideoOn(!videoOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              videoOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            }`}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setHandRaised(!handRaised)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              handRaised ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Hand className="w-5 h-5" />
          </button>

          {isModerator && (
            <button 
              onClick={() => setRecording(!recording)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hidden md:flex ${
                recording ? "bg-red-500 text-white animate-pulse" : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Disc className="w-5 h-5" />
            </button>
          )}

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button onClick={() => setActiveSidebar(activeSidebar === "chat" ? null : "chat")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeSidebar === 'chat' ? 'bg-violet-500 text-white' : 'hover:bg-white/10 text-white'}`}>
            <MessageSquare className="w-4 h-4" />
          </button>
          
          <button onClick={() => setActiveSidebar(activeSidebar === "users" ? null : "users")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeSidebar === 'users' ? 'bg-violet-500 text-white' : 'hover:bg-white/10 text-white'}`}>
            <Users className="w-4 h-4" />
          </button>

          <button onClick={() => setActiveSidebar(activeSidebar === "vocab" ? null : "vocab")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeSidebar === 'vocab' ? 'bg-violet-500 text-white' : 'hover:bg-white/10 text-white'}`}>
            <BookOpen className="w-4 h-4" />
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button 
            onClick={handleLeave}
            className="px-6 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            Rời phòng
          </button>
        </div>

        <div className="w-[100px] flex justify-end">
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Review Modal (For Members) */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#1a1d2d] rounded-3xl border border-white/10 p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-violet-500/30">
                  <Star className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Đánh giá buổi học</h2>
                <p className="text-sm text-muted-foreground">Chia sẻ trải nghiệm của bạn về buổi học hôm nay</p>
              </div>

              <form onSubmit={submitReview} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white block text-center">Chất lượng Moderator</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button key={i} type="button" className="text-amber-400 hover:scale-110 transition-transform">
                        <Star className="w-8 h-8 fill-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white block">Nhận xét (Tùy chọn)</label>
                  <textarea 
                    rows={3} 
                    placeholder="Buổi học rất hữu ích..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => router.push("/dashboard")} className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors">
                    Bỏ qua
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-semibold text-white bg-violet-500 hover:bg-violet-600 transition-colors shadow-lg shadow-violet-500/20">
                    Gửi đánh giá
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Modal (For Moderators) */}
      <AnimatePresence>
        {summaryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#1a1d2d] rounded-3xl border border-white/10 p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                  <BookOpen className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Báo cáo Buổi Học</h2>
                <p className="text-sm text-muted-foreground">Tóm tắt nội dung và nhận xét tổng quan</p>
              </div>

              <form onSubmit={submitSummary} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white block">Nội dung báo cáo</label>
                  <textarea 
                    rows={4} 
                    value={summaryText}
                    onChange={e => setSummaryText(e.target.value)}
                    placeholder="Các thành viên đã tham gia rất nhiệt tình..."
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="w-full py-3 rounded-xl font-semibold text-black bg-amber-500 hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20">
                    Nộp báo cáo & Rời phòng
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
