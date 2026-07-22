"use client";

import { MessageSquareDashed } from "lucide-react";
import { motion } from "framer-motion";

export default function MessagesIndexPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#0a0a0f] text-center p-8 relative overflow-hidden">
      {/* Decorative ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/10">
          <MessageSquareDashed className="w-10 h-10 text-violet-400 opacity-50" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Chưa chọn cuộc trò chuyện</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Chọn một người bạn từ danh sách bên trái hoặc bắt đầu một cuộc trò chuyện mới để kết nối ngay.
        </p>
      </motion.div>
    </div>
  );
}
