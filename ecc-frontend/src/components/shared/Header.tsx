"use client";

import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Header() {
  const { user } = useAuthStore();

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "ADMIN": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "MODERATOR": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ADMIN": return "Admin";
      case "MODERATOR": return "Moderator";
      default: return "Member";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-16 border-b border-white/5 glass-card flex items-center gap-4 px-6 flex-shrink-0 bg-background/50 backdrop-blur-xl"
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
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.2 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-500 text-[9px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_rgba(139,92,246,0.6)]"
          >
            3
          </motion.span>
        </motion.button>

        {/* User avatar */}
        <Link href="/profile" className="flex items-center gap-2.5 group cursor-pointer">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-violet-500/20"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full rounded-lg object-cover" />
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
