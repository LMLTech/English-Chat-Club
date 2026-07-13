"use client";

import { Bell, Search, Check, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notificationService, NotificationResponse } from "@/features/notification/notificationService";

export default function Header() {
  const { user } = useAuthStore();

  const getRoleColor = (role?: string) => {
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') return "text-red-400 bg-red-500/10 border-red-500/20";
    if (role === 'MODERATOR' || role === 'ROLE_MODERATOR') return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-violet-400 bg-violet-500/10 border-violet-500/20";
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') return "Admin";
    if (role === 'MODERATOR' || role === 'ROLE_MODERATOR') return "Moderator";
    return "Member";
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = () => {
      if (user) {
        notificationService.getNotifications(false)
          .then(setNotifications)
          .catch(console.error);
      }
    };

    fetchNotifications(); // Initial fetch
    
    // Poll every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-16 border-b border-white/5 glass-card flex items-center gap-4 px-6 flex-shrink-0 bg-background/50 backdrop-blur-xl z-30"
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-violet-400 transition-colors" />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/40 focus:bg-white/10 transition-all duration-300"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.2 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-500 text-[9px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_rgba(139,92,246,0.6)]"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-80 max-h-[400px] overflow-y-auto bg-[#1a1d2d] border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col"
              >
                <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5 sticky top-0 z-10">
                  <h3 className="font-semibold text-sm text-white">Thông báo</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">Không có thông báo nào</div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => !notif.isRead && handleRead(notif.id)}
                          className={`p-4 border-b border-white/5 transition-colors cursor-pointer ${
                            notif.isRead ? "opacity-60" : "bg-violet-500/5 hover:bg-violet-500/10"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                            {!notif.isRead && <div className="w-2 h-2 rounded-full bg-violet-500 mt-1 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-muted-foreground/50 mt-2 block">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <Link href="/profile" className="flex items-center gap-2.5 group cursor-pointer">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-violet-500/20 overflow-hidden"
            style={user?.avatarFrame ? { border: `2px solid ${user.avatarFrame}` } : {}}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{getInitials(user?.fullName)}</span>
            )}
          </motion.div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none group-hover:text-violet-300 transition-colors">
              {user?.fullName || "Người dùng"}
            </p>
            <div className="mt-1">
              <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-bold ${getRoleColor(user?.role ?? undefined)}`}>
                {getRoleLabel(user?.role ?? undefined)}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </motion.header>
  );
}
