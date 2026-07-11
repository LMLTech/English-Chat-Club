"use client";

import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

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
    <header className="h-16 border-b border-white/5 glass-card flex items-center gap-4 px-6 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-500 text-[9px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* User avatar */}
        <Link href="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full rounded-lg object-cover" />
            ) : (
              <span>{getInitials(user?.fullName)}</span>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none">
              {user?.fullName || "Người dùng"}
            </p>
            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${getRoleColor(user?.role ?? undefined)}`}>
              {getRoleLabel(user?.role ?? undefined)}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
