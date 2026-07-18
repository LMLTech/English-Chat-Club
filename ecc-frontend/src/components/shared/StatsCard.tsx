"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  gradient?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-violet-400",
  trend,
  gradient = "from-violet-500/10 to-blue-500/10",
}: StatsCardProps) {
  return (
    <div className="relative glass-panel rounded-xl p-5 h-full overflow-hidden group">
      {/* Background gradient blob */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />
      
      {/* Hover Light Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-[spin_4s_linear_infinite] blur-xl pointer-events-none transition-opacity duration-700" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black/20 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300 ${iconColor}`}>
            <Icon className="w-6 h-6 drop-shadow-md" />
          </div>
          
          {trend && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${trend.positive ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"}`}>
              {trend.positive ? "▲" : "▼"} {trend.value}
            </div>
          )}
        </div>

        <div>
          {/* Value */}
          <div className="flex items-end gap-2 mb-1">
            <span className="text-3xl font-black text-white tracking-tight drop-shadow-sm">{value}</span>
          </div>

          {/* Title */}
          <p className="text-[15px] font-semibold text-slate-300 group-hover:text-white transition-colors">{title}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium truncate">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
