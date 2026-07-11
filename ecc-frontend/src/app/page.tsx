"use client";

import { motion } from "framer-motion";
import { Mic, Globe, Users, Trophy, ChevronRight, Star, Video, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden font-sans selection:bg-violet-500/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-20 border-b border-white/5 bg-black/40 backdrop-blur-md z-50 flex items-center px-6 md:px-12">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            English Chat Club
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <Link href="#features" className="hover:text-white transition-colors">Tính năng</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">Cách hoạt động</Link>
          <Link href="#testimonials" className="hover:text-white transition-colors">Đánh giá</Link>
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-white/80 hover:text-white transition-colors hidden sm:block">
            Đăng nhập
          </Link>
          <Link href="/register" className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            Tham gia ngay
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-violet-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> Nền tảng luyện nói Tiếng Anh #1
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Nói Tiếng Anh Tự Tin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400">
              Mọi Lúc, Mọi Nơi
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
            Tham gia các phòng hội thoại video trực tiếp với người hướng dẫn (Moderator) và cộng đồng học viên cùng trình độ. Xóa bỏ rào cản ngôn ngữ thông qua thực hành giao tiếp thực tế.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-violet-600 text-white font-bold text-lg hover:bg-violet-700 transition-all shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2">
              Bắt đầu miễn phí <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/sessions" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Video className="w-5 h-5" /> Khám phá phòng học
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div variants={fadeInUp} className="mt-16 flex items-center gap-4 text-sm text-white/50">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i}`} alt="User" className="w-10 h-10 rounded-full border-2 border-[#0a0a0f]" />
              ))}
            </div>
            <p>Hơn <strong>10,000+</strong> học viên đã tham gia</p>
          </motion.div>

        </motion.div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 px-6 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Hệ sinh thái học tập toàn diện</h2>
            <p className="text-muted-foreground text-lg">Mọi công cụ bạn cần để làm chủ giao tiếp Tiếng Anh</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-violet-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Phòng Hội Thoại Video</h3>
              <p className="text-muted-foreground leading-relaxed">
                Thực hành nói trực tiếp thông qua công nghệ WebRTC độ trễ thấp. Môi trường thân thiện, được chia theo trình độ CEFR từ A1 đến C2.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hệ thống Gamification</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tích lũy điểm kinh nghiệm (XP), nhận huy hiệu (Badges) và leo bảng xếp hạng hàng tuần. Đổi điểm lấy những phần quà độc quyền.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cộng đồng & Nhắn tin</h3>
              <p className="text-muted-foreground leading-relaxed">
                Kết bạn, trò chuyện riêng tư và tham gia diễn đàn thảo luận (Forum). Không bao giờ đơn độc trên hành trình chinh phục ngoại ngữ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">3 Bước để bắt đầu giao tiếp tự tin</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xl text-violet-400">1</div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Đăng ký tài khoản</h4>
                    <p className="text-muted-foreground">Tạo tài khoản miễn phí bằng Email và làm bài test xác định trình độ CEFR.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xl text-violet-400">2</div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Đặt chỗ & Tham gia</h4>
                    <p className="text-muted-foreground">Chọn chủ đề yêu thích, đặt chỗ (Book session) và vào phòng học đúng giờ.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center font-bold text-xl text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]">3</div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Thực hành & Nhận phản hồi</h4>
                    <p className="text-white/80">Tương tác trực tiếp với Moderator, nhận sửa lỗi phát âm và tích lũy điểm thưởng sau buổi học.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
              {/* Mock Dashboard UI Graphic */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent p-6">
                <div className="w-full h-8 flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4">
                  <div className="h-24 rounded-xl bg-white/5 border border-white/5 flex items-center p-4 gap-4">
                    <div className="w-16 h-16 rounded-lg bg-violet-500/20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 bg-white/10 rounded" />
                      <div className="h-3 w-1/3 bg-white/5 rounded" />
                    </div>
                  </div>
                  <div className="h-24 rounded-xl bg-white/5 border border-white/5 flex items-center p-4 gap-4">
                    <div className="w-16 h-16 rounded-lg bg-blue-500/20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-white/10 rounded" />
                      <div className="h-3 w-1/4 bg-white/5 rounded" />
                    </div>
                  </div>
                  <div className="h-24 rounded-xl bg-white/5 border border-white/5 flex items-center p-4 gap-4">
                    <div className="w-16 h-16 rounded-lg bg-emerald-500/20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 bg-white/10 rounded" />
                      <div className="h-3 w-1/2 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-violet-600 to-indigo-600 p-12 md:p-20 text-center relative overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.3)] border border-white/20">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-white/10 blur-[80px] rounded-full" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Sẵn sàng để bắt đầu?</h2>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Đăng ký tài khoản ngay hôm nay và nhận ngay 100 Điểm thưởng chào mừng để đổi vé tham gia phòng học chất lượng cao.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-violet-600 font-bold text-lg hover:scale-105 transition-transform shadow-xl">
              Đăng ký tài khoản miễn phí <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Mic className="w-6 h-6 text-violet-500" />
            <span className="text-xl font-bold">ECC</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} English Chat Club. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
