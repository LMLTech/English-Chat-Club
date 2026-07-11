"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence, type Variants } from "framer-motion";
import { Mic, Globe, Users, Trophy, ChevronRight, Star, Video, MessageSquare, Sparkles, ArrowDown, BookOpen, Shield, Zap, Heart, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── Animations ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] } }
};

/* ─── Section observer hook ─── */
function useAnimateInView() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return { ref, isInView };
}

/* ─── Counter Component ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── FEATURES DATA ─── */
const FEATURES = [
  {
    icon: Video,
    title: "Phòng Hội Thoại Trực Tuyến",
    desc: "Tham gia các phòng video call theo chủ đề với moderator chuyên nghiệp. Phân chia theo trình độ CEFR (A1–C2).",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
  {
    icon: Trophy,
    title: "Gamification & Bảng Xếp Hạng",
    desc: "Tích lũy điểm XP, nhận huy hiệu, leo bảng xếp hạng hàng tuần. Đổi điểm lấy phần quà hấp dẫn từ cửa hàng.",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  {
    icon: MessageSquare,
    title: "Cộng Đồng & Nhắn Tin",
    desc: "Kết bạn, nhắn tin riêng, tham gia Forum thảo luận. Xây dựng mạng lưới bạn bè cùng chí hướng.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: BookOpen,
    title: "Tài Nguyên Học Tập",
    desc: "Thư viện bài viết, video hướng dẫn, từ vựng nổi bật được moderator tổng hợp sau mỗi buổi học.",
    gradient: "from-blue-500 to-cyan-600",
    glow: "shadow-blue-500/20",
  },
  {
    icon: Shield,
    title: "Hệ Thống Kiểm Duyệt",
    desc: "Moderator giám sát phòng học, cảnh cáo vi phạm, đảm bảo môi trường học tập lành mạnh và chuyên nghiệp.",
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/20",
  },
  {
    icon: Zap,
    title: "Sự Kiện & Thử Thách",
    desc: "Các sự kiện đặc biệt, cuộc thi nói tiếng Anh và thử thách hàng tuần với phần thưởng XP cực lớn.",
    gradient: "from-indigo-500 to-violet-600",
    glow: "shadow-indigo-500/20",
  },
];

const STEPS = [
  { num: "01", title: "Đăng ký tài khoản", desc: "Tạo tài khoản miễn phí với email Gmail. Làm bài test để xác định trình độ CEFR của bạn." },
  { num: "02", title: "Chọn & Đặt chỗ", desc: "Duyệt các phòng học theo chủ đề yêu thích, trình độ phù hợp rồi đặt chỗ (Book Session)." },
  { num: "03", title: "Tham gia & Thực hành", desc: "Vào phòng video call đúng giờ, tương tác trực tiếp với Moderator và các thành viên khác." },
  { num: "04", title: "Nhận phản hồi & Phần thưởng", desc: "Đánh giá buổi học, nhận XP, huy hiệu và leo rank trên bảng xếp hạng cộng đồng." },
];

const TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Sinh viên ĐH Bách Khoa", text: "ECC giúp mình tự tin giao tiếp tiếng Anh hơn rất nhiều. Các buổi học thực tế và vui hơn học trên lớp!", avatar: 1, rating: 5 },
  { name: "Trần Thanh Hùng", role: "Kỹ sư phần mềm", text: "Hệ thống gamification rất hay, mình bị cuốn vào leo rank mỗi tuần. Tiếng Anh cải thiện mà không hề nhàm chán.", avatar: 3, rating: 5 },
  { name: "Lê Thu Hà", role: "Nhân viên Marketing", text: "Moderator rất nhiệt tình và chuyên nghiệp. Mình đã tăng từ B1 lên B2 sau 3 tháng sử dụng ECC.", avatar: 5, rating: 5 },
];

/* ═══════════════════════════════════════════════════ */
/* ═══               MAIN COMPONENT              ═══ */
/* ═══════════════════════════════════════════════════ */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const featRef = useAnimateInView();
  const stepRef = useAnimateInView();
  const testRef = useAnimateInView();
  const statsRef = useAnimateInView();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden font-sans selection:bg-violet-500/30">

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="fixed top-0 inset-x-0 h-20 bg-black/60 backdrop-blur-xl z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight">English Chat Club</span>
              <p className="text-[10px] text-white/40 tracking-widest uppercase -mt-0.5">Speak Fluently</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors duration-300">Tính năng</a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-300">Cách hoạt động</a>
            <a href="#testimonials" className="hover:text-white transition-colors duration-300">Đánh giá</a>
            <a href="#stats" className="hover:text-white transition-colors duration-300">Cộng đồng</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-white/70 hover:text-white transition-colors px-4 py-2">
              Đăng nhập
            </Link>
            <Link href="/register" className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-shadow duration-500">
              <span className="relative z-10">Tham gia miễn phí</span>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">Tính năng</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">Cách hoạt động</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">Đánh giá</a>
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Link href="/login" className="flex-1 text-center py-3 rounded-xl bg-white/5 text-white font-semibold">Đăng nhập</Link>
                  <Link href="/register" className="flex-1 text-center py-3 rounded-xl bg-violet-600 text-white font-semibold">Đăng ký</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════ HERO SECTION (Reflexion-style Full Screen) ═══════════ */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-video-call-at-home-with-her-friends-42728-large.mp4" type="video/mp4" />
          </video>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0f]" />
          {/* Animated Grain */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E\")" }} />
        </motion.div>

        {/* Hero Content */}
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.07] border border-white/[0.1] text-violet-300 text-sm font-medium mb-10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Nền tảng luyện nói Tiếng Anh #1 Việt Nam
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.1] tracking-tight mb-8">
            nói tiếng anh tự tin<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400">
              mọi lúc, mọi nơi
            </span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-14 leading-relaxed font-light">
            Tham gia các phòng hội thoại video trực tuyến với Moderator và cộng đồng học viên cùng trình độ. 
            Xoá bỏ rào cản giao tiếp thông qua thực hành thực tế.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="group w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-all duration-500 flex items-center justify-center gap-2">
              Bắt đầu miễn phí
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-10 py-4 rounded-full bg-white/[0.06] border border-white/[0.12] text-white font-semibold text-lg hover:bg-white/[0.1] transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
              <Video className="w-5 h-5" /> Đăng nhập
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-[11px] tracking-[4px] uppercase text-white/30 font-medium">Khám phá</span>
          <ChevronDown className="w-5 h-5 text-white/30" />
        </motion.div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section id="stats" ref={statsRef.ref} className="relative py-20 border-y border-white/[0.05] bg-[#0d0d14]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate={statsRef.isInView ? "visible" : "hidden"}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: 10000, suffix: "+", label: "Học viên", color: "text-violet-400" },
              { value: 500, suffix: "+", label: "Buổi học đã tổ chức", color: "text-blue-400" },
              { value: 50, suffix: "+", label: "Moderator chuyên nghiệp", color: "text-emerald-400" },
              { value: 95, suffix: "%", label: "Hài lòng", color: "text-amber-400" },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp}  className="text-center">
                <p className={`text-4xl md:text-5xl font-extrabold ${stat.color} mb-2`}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-white/40 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FEATURES (Reflexion-style sticky blocks) ═══════════ */}
      <section id="features" ref={featRef.ref} className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" animate={featRef.isInView ? "visible" : "hidden"} variants={fadeUp} className="text-center mb-20">
            <p className="text-xs tracking-[6px] uppercase text-violet-400 font-bold mb-4">Tính năng nổi bật</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5">Hệ sinh thái học tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">toàn diện</span></h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">Mọi công cụ bạn cần để làm chủ giao tiếp Tiếng Anh, được thiết kế bởi đội ngũ giáo dục chuyên nghiệp.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial="hidden"
                animate={featRef.isInView ? "visible" : "hidden"}
                variants={fadeUp}
                
                className={`group relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:shadow-2xl ${feat.glow}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-6 shadow-lg ${feat.glow} group-hover:scale-110 transition-transform duration-500`}>
                  <feat.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-white/95 transition-colors">{feat.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SHOWCASE IMAGE ═══════════ */}
      <section className="py-10 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={scaleIn} className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-violet-500/10">
            <Image
              src="/images/feature-mockup.png"
              alt="ECC Platform Mockup"
              width={1200}
              height={675}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" ref={stepRef.ref} className="py-32 relative overflow-hidden">
        {/* BG Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" animate={stepRef.isInView ? "visible" : "hidden"} variants={fadeUp} className="text-center mb-20">
            <p className="text-xs tracking-[6px] uppercase text-emerald-400 font-bold mb-4">Bắt đầu từ đây</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5">4 bước để <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">giao tiếp tự tin</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial="hidden"
                animate={stepRef.isInView ? "visible" : "hidden"}
                variants={fadeUp}
                
                className="relative group"
              >
                {/* Connecting Line */}
                {i < 3 && <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />}

                <div className="relative z-10 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-500">
                  <div className="text-5xl font-black text-white/[0.05] mb-4 group-hover:text-emerald-500/10 transition-colors">{step.num}</div>
                  <h4 className="text-lg font-bold mb-3 group-hover:text-emerald-300 transition-colors">{step.title}</h4>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COMMUNITY IMAGE ═══════════ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <p className="text-xs tracking-[6px] uppercase text-blue-400 font-bold mb-4">Cộng đồng</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Kết nối với <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">hàng ngàn</span> học viên</h2>
              <p className="text-white/40 text-lg leading-relaxed mb-8">
                English Chat Club không chỉ là nơi học Tiếng Anh — đó là một cộng đồng sôi động nơi bạn tìm thấy bạn bè, mentor và cảm hứng mỗi ngày. 
                Diễn đàn thảo luận, nhắn tin riêng tư, hệ thống kết bạn và bảng xếp hạng hàng tuần sẽ giữ cho bạn luôn có động lực.
              </p>
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-shadow duration-500">
                Gia nhập cộng đồng <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} className="relative">
              <Image
                src="/images/community.png"
                alt="ECC Community"
                width={700}
                height={500}
                className="w-full h-auto rounded-3xl border border-white/[0.08]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section id="testimonials" ref={testRef.ref} className="py-32 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" animate={testRef.isInView ? "visible" : "hidden"} variants={fadeUp} className="text-center mb-16">
            <p className="text-xs tracking-[6px] uppercase text-amber-400 font-bold mb-4">Đánh giá</p>
            <h2 className="text-3xl md:text-5xl font-bold">Học viên nói gì về <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">ECC</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial="hidden"
                animate={testRef.isInView ? "visible" : "hidden"}
                variants={fadeUp}
                
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/20 transition-all duration-500"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/60 leading-relaxed mb-8 text-sm italic">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <img src={`https://i.pravatar.cc/100?img=${t.avatar}`} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white/10" />
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA SECTION ═══════════ */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto relative">
          {/* Glow BG */}
          <div className="absolute -inset-6 bg-gradient-to-br from-violet-600/20 to-blue-600/20 blur-3xl rounded-[4rem] pointer-events-none" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="relative rounded-[3rem] bg-gradient-to-br from-violet-600 to-indigo-700 p-14 md:p-20 text-center overflow-hidden border border-white/20"
          >
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[400px] h-[400px] bg-white/10 blur-[80px] rounded-full" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[300px] h-[300px] bg-blue-400/10 blur-[60px] rounded-full" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Sẵn sàng chinh phục Tiếng Anh?</h2>
              <p className="text-white/70 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                Đăng ký ngay hôm nay để nhận <strong className="text-white">100 Điểm XP</strong> chào mừng 
                và trải nghiệm miễn phí các phòng hội thoại chất lượng cao.
              </p>
              <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-violet-700 font-bold text-lg hover:scale-105 transition-transform shadow-2xl shadow-black/30">
                Tạo tài khoản miễn phí <ChevronRight className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/[0.05] bg-black/60 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">ECC</span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed">
                Nền tảng luyện nói Tiếng Anh trực tuyến kết hợp mạng xã hội học tập, tạo môi trường thực hành sinh động và hiệu quả.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-bold text-white/80 mb-4 tracking-wider uppercase">Sản phẩm</h4>
              <ul className="space-y-3 text-sm text-white/30">
                <li><Link href="/register" className="hover:text-white transition-colors">Phòng hội thoại</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Bảng xếp hạng</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Diễn đàn</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Cửa hàng quà tặng</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white/80 mb-4 tracking-wider uppercase">Hỗ trợ</h4>
              <ul className="space-y-3 text-sm text-white/30">
                <li><Link href="/register" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Liên hệ</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Hướng dẫn sử dụng</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white/80 mb-4 tracking-wider uppercase">Pháp lý</h4>
              <ul className="space-y-3 text-sm text-white/30">
                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} English Chat Club. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Globe className="w-4 h-4 text-white/40" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Heart className="w-4 h-4 text-white/40" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
