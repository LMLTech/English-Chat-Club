"use client";

import { useEffect, useState } from "react";
import { communityService } from "@/features/community/communityService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Search, Users, Circle, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";




export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const [friendIds, setFriendIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [friendProfiles, setFriendProfiles] = useState<any[]>([]);

  useEffect(() => {
    // In real app, fetch actual friend profiles
    communityService.getFriends()
      .then(async (ids) => {
        setFriendIds(ids);
        
        // Fetch profiles for each friend
        const { profileService } = await import("@/features/profile/profileService");
        const profiles = await Promise.all(
          ids.map(id => profileService.getProfileById(id).catch(() => null))
        );
        setFriendProfiles(profiles.filter(p => p !== null));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" text="Đang tải tin nhắn..." /></div>;

  // Only show real friends from API - no mock data
  const displayFriends = friendIds.map(id => {
    const profile = friendProfiles.find(p => p.id === id);
    return {
      id, 
      name: profile?.fullName || `Người dùng #${id}`,
      avatar: profile?.avatarUrl || `https://i.pravatar.cc/150?u=${id}`,
      status: "offline" as string,
      lastMessage: "Nhấn để bắt đầu trò chuyện...",
      time: "",
      unread: 0
    };
  });

  return (
    <div className="flex-1 h-full flex overflow-hidden bg-black/20 rounded-tl-2xl border-t border-l border-white/5">
      {/* Friends Sidebar (Discord style channel list) */}
      <aside className="w-80 flex-shrink-0 border-r border-white/5 bg-background/40 backdrop-blur-xl flex flex-col h-full z-10">
        <div className="h-14 border-b border-white/5 px-4 flex items-center justify-between shadow-sm">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            Bạn bè & Tin nhắn
          </h2>
          <button className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-violet-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm cuộc trò chuyện..." 
              className="w-full bg-black/40 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 focus:bg-black/60 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {displayFriends.map((friend) => {
            const isActive = pathname === `/messages/${friend.id}`;
            return (
              <Link 
                key={friend.id} 
                href={`/messages/${friend.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                  isActive 
                    ? "bg-violet-500/15" 
                    : "hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-chat"
                    className="absolute inset-0 border border-violet-500/30 rounded-xl bg-gradient-to-r from-violet-500/10 to-transparent -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className="relative">
                  <img src={friend.avatar} alt={friend.name} className="w-11 h-11 rounded-full object-cover shadow-lg border border-white/10" />
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#12141c] ${friend.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-500'}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={cn("text-sm font-bold truncate transition-colors", isActive ? "text-violet-300" : "text-white group-hover:text-white/90")}>
                      {friend.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground">{friend.time}</span>
                  </div>
                  <p className={cn("text-xs truncate", isActive ? "text-violet-200/70" : "text-muted-foreground group-hover:text-white/60")}>
                    {friend.lastMessage}
                  </p>
                </div>
                
                {friend.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                    {friend.unread}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-[#0a0a0f]">
        {children}
      </main>
    </div>
  );
}
