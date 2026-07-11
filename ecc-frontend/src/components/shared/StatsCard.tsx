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
    <div className="stats-card">
      {/* Background gradient blob */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-50`} />

      <div className="relative">
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 mb-3 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Value */}
        <div className="flex items-end gap-2 mb-1">
          <span className="text-2xl font-bold text-white">{value}</span>
          {trend && (
            <span className={`text-xs font-medium mb-0.5 ${trend.positive ? "text-green-400" : "text-red-400"}`}>
              {trend.positive ? "▲" : "▼"} {trend.value}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-foreground/80">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
