/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring,
  useMotionValue,
} from "framer-motion";
import {
  Mic,
  ArrowUpRight,
  ArrowRight,
  Video,
  BookOpen,
  Trophy,
  ChevronDown,
  Menu,
  X,
  Send,
  Users,
  Shield,
  MessageSquare,
  Sparkles,
  Globe2,
  Flame,
  Headphones,
  Quote,
  Target,
  Heart,
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────
// CONSTANTS & DATA
// ─────────────────────────────────────────────────────────────────────────

const PARTICLES = [
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=700&h=700&fit=crop",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=700&h=700&fit=crop",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&h=700&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&h=700&fit=crop",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&h=700&fit=crop",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=700&h=700&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&h=700&fit=crop",
];

const FEATURES = [
  {
    icon: Video,
    title: "Video Call Sống Động",
    desc: "Trải nghiệm phòng họp trực tuyến mượt mà, độ trễ cực thấp. Chia sẻ màn hình và tương tác thời gian thực.",
    gradient: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-500/20",
    hoverShadow: "group-hover:shadow-cyan-500/40",
  },
  {
    icon: Trophy,
    title: "Hệ Thống Gamification",
    desc: "Học tập không nhàm chán với hệ thống điểm thưởng, huy hiệu và bảng xếp hạng hàng tuần.",
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/20",
    hoverShadow: "group-hover:shadow-orange-500/40",
  },
  {
    icon: BookOpen,
    title: "Tài Nguyên Phong Phú",
    desc: "Thư viện tài liệu học tập, từ vựng và bài tập thực hành được cập nhật mỗi ngày.",
    gradient: "from-fuchsia-400 to-pink-500",
    shadow: "shadow-pink-500/20",
    hoverShadow: "group-hover:shadow-pink-500/40",
  },
];

const EXTRA_SERVICES = [
  { icon: Users, title: "Club Giao Lưu Hàng Tuần", desc: "Hàng trăm phòng đàm thoại chủ đề đa dạng từ Đời sống, Công nghệ tới Kinh tế.", color: "text-emerald-400", bgGlow: "from-emerald-500/10 to-transparent" },
  { icon: Shield, title: "Môi Trường Bảo Mật & Sạch", desc: "Hệ thống kiểm duyệt AI kết hợp đội ngũ moderator 24/7 bảo vệ cộng đồng học viên lành mạnh.", color: "text-blue-400", bgGlow: "from-blue-500/10 to-transparent" },
  { icon: MessageSquare, title: "Nhắn Tin Tức Thời", desc: "Giao lưu, làm quen và chat nhóm học tập ngay trên nền tảng mà không cần ứng dụng ngoài.", color: "text-purple-400", bgGlow: "from-purple-500/10 to-transparent" },
];

const TESTIMONIALS = [
  "Nền tảng tuyệt vời để luyện nói tiếng Anh mỗi ngày!",
  "Giao diện đỉnh cao, trải nghiệm siêu mượt mà.",
  "Community rất thân thiện, Moderator chuyên nghiệp.",
  "Từ B1 lên B2 chỉ sau 3 tháng sử dụng English Chat Club.",
  "Thiết kế chuyển động mượt mà, màu sắc đỉnh cao vô cùng tinh tế!",
];

const PULSE_STATS = [
  { icon: Users, value: "12,480", label: "Đang trực tuyến" },
  { icon: Globe2, value: "63", label: "Quốc gia thành viên" },
  { icon: Flame, value: "3,204", label: "Phòng đang mở hôm nay" },
  { icon: Trophy, value: "89,110", label: "XP được trao tuần này" },
];

const STEPS = [
  { n: "01", title: "Tạo hồ sơ trong 60 giây", desc: "Chọn trình độ hiện tại (A1 → C2) và chủ đề bạn yêu thích để hệ thống gợi ý club phù hợp.", gradient: "from-indigo-500/25 via-indigo-500/5 to-transparent", ring: "hover:border-indigo-400/50", numGradient: "from-indigo-300 to-blue-400" },
  { n: "02", title: "Vào phòng, bật mic", desc: "Tham gia video call cùng người học khác, có moderator dẫn dắt chủ đề mỗi buổi.", gradient: "from-pink-500/25 via-pink-500/5 to-transparent", ring: "hover:border-pink-400/50", numGradient: "from-pink-300 to-fuchsia-400" },
  { n: "03", title: "Ghi điểm, lên hạng", desc: "Mỗi phút luyện nói đổi thành XP, mở khoá huy hiệu và leo bảng xếp hạng tuần.", gradient: "from-amber-500/25 via-amber-500/5 to-transparent", ring: "hover:border-amber-400/50", numGradient: "from-amber-300 to-orange-400" },
];

// Every milestone below happens within the current year — ECC's whole
// journey-so-far, told as a single fast-moving 2026 timeline.
const TIMELINE = [
  { year: "Tháng 01 · 2026", title: "Khởi động phiên bản hoàn toàn mới", desc: "English Chat Club làm mới toàn bộ trải nghiệm ngay từ đầu năm 2026, đặt nền móng cho một cộng đồng lớn mạnh hơn." },
  { year: "Tháng 04 · 2026", title: "Mở rộng hệ thống Club", desc: "Hàng loạt club chủ đề mới ra mắt trong năm 2026, phủ sóng từ Đời sống, Công nghệ đến Kinh doanh." },
  { year: "Tháng 07 · 2026", title: "Nâng cấp nền tảng Video Call", desc: "Trải nghiệm gọi video mượt mà hơn, độ trễ thấp hơn, sẵn sàng cho hàng nghìn phòng học cùng lúc." },
  { year: "Tháng 10 · 2026", title: "Gamification thế hệ mới", desc: "Hệ thống XP, huy hiệu và bảng xếp hạng được làm mới, tạo động lực luyện nói mỗi ngày." },
  { year: "Cuối · 2026", title: "Phủ sóng 60+ quốc gia", desc: "Thành viên trực tuyến 24/7 từ khắp nơi trên thế giới — tất cả cột mốc trên đều diễn ra ngay trong năm nay." },
];

const VALUES = [
  { icon: Users, title: "Cộng Đồng Trên Hết", desc: "Mọi tính năng chúng tôi xây đều phục vụ một mục tiêu duy nhất: kết nối người học với nhau.", gradient: "from-indigo-500/20 to-transparent", iconBg: "from-indigo-500 to-blue-500", ring: "hover:border-indigo-400/40" },
  { icon: Sparkles, title: "Học Qua Trải Nghiệm", desc: "Không lý thuyết suông — bạn tiến bộ bằng cách nói, sai, được góp ý, và nói lại.", gradient: "from-fuchsia-500/20 to-transparent", iconBg: "from-fuchsia-500 to-pink-500", ring: "hover:border-fuchsia-400/40" },
  { icon: Shield, title: "Không Gian An Toàn", desc: "Kiểm duyệt nghiêm ngặt để bất kỳ ai cũng tự tin mở lời mà không sợ bị đánh giá.", gradient: "from-emerald-500/20 to-transparent", iconBg: "from-emerald-500 to-teal-500", ring: "hover:border-emerald-400/40" },
  { icon: Globe2, title: "Tư Duy Toàn Cầu", desc: "Sản phẩm được xây cho người học ở mọi quốc gia, mọi múi giờ, mọi trình độ.", gradient: "from-amber-500/20 to-transparent", iconBg: "from-amber-500 to-orange-500", ring: "hover:border-amber-400/40" },
];

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=1000&fit=crop", caption: "Buổi club chủ đề Du lịch", span: "row-span-2" },
  { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop", caption: "Học viên luyện nói cặp đôi", span: "" },
  { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=800&fit=crop", caption: "Góc học tập tại nhà", span: "" },
  { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1000&fit=crop", caption: "Trò chuyện ngoài trời", span: "row-span-2" },
  { src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=800&fit=crop", caption: "Video call nhóm bạn học", span: "" },
  { src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=800&fit=crop", caption: "Câu lạc bộ đàm thoại", span: "" },
  { src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=1000&fit=crop", caption: "Không gian học tập tại quán cà phê", span: "row-span-2" },
  { src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=800&fit=crop", caption: "Đội ngũ moderator English Chat Club", span: "" },
];

const FAQS = [
  { q: "Tôi trình độ A1, có tham gia được không?", a: "Hoàn toàn được. Hệ thống gợi ý club sẽ xếp bạn vào những phòng phù hợp với trình độ A1–A2, có moderator hỗ trợ nói chậm và giải thích lại khi cần." },
  { q: "Tôi có cần trả phí để tham gia không?", a: "Bạn có thể tạo tài khoản và vào các phòng công khai hoàn toàn miễn phí. Gói Premium chỉ mở khoá thêm club chuyên sâu, huy hiệu giới hạn và ưu tiên chọn phòng." },
  { q: "Nếu tôi bị nhút nhát, không dám bật mic thì sao?", a: "Bạn có thể tham gia phòng ở chế độ lắng nghe trước, gõ chat để tương tác, rồi bật mic khi đã sẵn sàng. Moderator luôn tạo không khí thoải mái, không áp lực." },
  { q: "Nền tảng có hoạt động trên điện thoại không?", a: "Có. English Chat Club chạy mượt trên trình duyệt di động, không cần cài thêm ứng dụng ngoài để tham gia video call hay chat nhóm." },
  { q: "Làm sao để báo cáo hành vi không phù hợp?", a: "Mỗi phòng đều có nút báo cáo trực tiếp gửi tới đội ngũ moderator 24/7, kết hợp hệ thống kiểm duyệt AI để xử lý nhanh chóng." },
];

const PARTNERS = [
  "GLOBAL SPEAK ALLIANCE",
  "CEFR CERTIFIED",
  "GOLDEN MIC NETWORK",
  "GLOBE TALK LABS",
  "GALAXY MEDIA GROUP",
  "BRIGHT VOICE FOUNDATION",
];

const ABOUT_STATS = [
  { value: "63", label: "Quốc gia" },
  { value: "480+", label: "Moderator toàn cầu" },
  { value: "2.1M", label: "Phút luyện nói / tháng" },
  { value: "4.9/5", label: "Điểm hài lòng" },
];

// ─────────────────────────────────────────────────────────────────────────
// SHARED / ATMOSPHERIC COMPONENTS
// ─────────────────────────────────────────────────────────────────────────

/** Thin gradient bar pinned to the very top, filling as the page is scrolled. */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-[70]"
    />
  );
}

/** Soft radial light that follows the cursor across the whole page — gives every
 *  dark section a sense of depth and life without being a visual gimmick per-section. */
function CursorGlow() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 hidden md:block transition-opacity duration-500"
      style={{
        opacity: pos ? 1 : 0,
        background: pos
          ? `radial-gradient(750px circle at ${pos.x}px ${pos.y}px, rgba(165,180,252,0.20), rgba(244,114,182,0.13) 35%, rgba(103,232,249,0.06) 55%, transparent 70%)`
          : undefined,
      }}
    />
  );
}

/** Subtle animated dot-grid used to break up flat dark backgrounds. */
function DotGrid({ className = "", opacity = 0.15 }: { className?: string; opacity?: number }) {
  return (
    <motion.div
      aria-hidden
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        opacity,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1.4px)",
        backgroundSize: "26px 26px",
      }}
      animate={{ backgroundPosition: ["0px 0px", "26px 26px"] }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
    />
  );
}

/** A cluster of drifting, breathing gradient blobs — reusable per-section
 *  so every panel of the page feels alive, not just the hero. Brighter, more
 *  saturated palette than a typical dark-mode blob so sections never read as flat/dark. */
function FloatingOrbs({ variant = "default" }: { variant?: "default" | "warm" | "cool" | "vivid" }) {
  const palettes: Record<string, string[]> = {
    default: ["from-purple-500/30 to-indigo-500/20", "from-pink-500/25 to-fuchsia-500/10"],
    warm: ["from-amber-400/30 to-orange-500/15", "from-pink-400/25 to-rose-500/10"],
    cool: ["from-cyan-400/30 to-blue-500/15", "from-indigo-400/25 to-violet-500/10"],
    vivid: ["from-fuchsia-400/30 to-purple-500/15", "from-emerald-400/25 to-cyan-500/10"],
  };
  const [a, b] = palettes[variant];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{ scale: [1, 1.25, 1], x: [0, 70, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-[10%] right-[-5%] w-[460px] h-[460px] bg-gradient-to-r ${a} blur-[110px] rounded-full`}
      />
      <motion.div
        animate={{ scale: [1.15, 0.9, 1.15], x: [0, -60, 0], y: [0, 60, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute bottom-[5%] left-[-5%] w-[420px] h-[420px] bg-gradient-to-r ${b} blur-[100px] rounded-full`}
      />
    </div>
  );
}

/** Slow-rotating conic "aurora" wash that sits behind everything on the page.
 *  This is the main thing that lifts the site out of "too dark" territory —
 *  a soft, ever-shifting spread of color glowing up through the black base
 *  instead of flat single-tone blobs. */
function AuroraBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 w-[160vw] h-[160vw] -translate-x-1/2 -translate-y-1/2 opacity-40 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(99,102,241,0.35), rgba(236,72,153,0.30), rgba(56,189,248,0.30), rgba(251,191,36,0.22), rgba(168,85,247,0.32), rgba(99,102,241,0.35))",
          filter: "blur(120px)",
        }}
      />
      <motion.div
        aria-hidden
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-fuchsia-500/10"
      />
    </div>
  );
}

/** Colorful ripple / spark burst wherever the person clicks — "bấm tới đâu,
 *  hiệu ứng sáng tới đó". Purely decorative, ignores clicks on form fields. */
function ClickBurst() {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select")) return;
      const id = idRef.current++;
      setBursts((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 900);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const colors = ["#818cf8", "#f472b6", "#67e8f9", "#fbbf24", "#c084fc"];

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
            <motion.span
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 3.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-white/50"
            />
            {colors.map((c, i) => {
              const angle = (i / colors.length) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(angle) * 46, y: Math.sin(angle) * 46, opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ background: c, boxShadow: `0 0 10px ${c}` }}
                />
              );
            })}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Small animated equalizer bars — a playful nod to "speaking / audio" without
 *  reaching for a generic waveform icon. */
function SoundBars({ className = "" }: { className?: string }) {
  const bars = [0, 1, 2, 3, 4, 5];
  return (
    <div className={`flex items-end gap-[3px] h-5 ${className}`}>
      {bars.map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-indigo-400 to-pink-400"
          animate={{ height: ["25%", "100%", "45%", "80%", "25%"] }}
          transition={{ duration: 1.1 + (i % 3) * 0.25, repeat: Infinity, ease: "easeInOut", delay: i * 0.09 }}
        />
      ))}
    </div>
  );
}

/** Wraps any card in a subtle 3D tilt that responds to mouse position, plus a
 *  moving glare highlight — used across features / values / step cards. */
function TiltCard({ children, className = "" }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useTransform(y, [0, 1], [7, -7]);
  const rotateY = useTransform(x, [0, 1], [-7, 7]);
  const glareX = useTransform(x, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(y, [0, 1], ["0%", "100%"]);

  function handleMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }
  function handleLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 900 }}
      transition={{ type: "spring", stiffness: 160, damping: 14 }}
      className={`relative ${className}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [glareX, glareY] as any,
            ([gx, gy]: any) => `radial-gradient(220px circle at ${gx} ${gy}, rgba(255,255,255,0.10), transparent 70%)`
          ) as any,
        }}
      />
      {children}
    </motion.div>
  );
}

/** Numbered vertical timeline node, reused in About Us. */
function TimelineRow({ item, index, isLast }: { item: (typeof TIMELINE)[number]; index: number; isLast: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="relative flex gap-6 md:gap-10 pb-14 last:pb-0"
    >
      <div className="flex flex-col items-center shrink-0">
        <span className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#0c0d14] border border-indigo-500/40 text-[11px] font-black text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
          {index + 1}
          <span className="absolute inset-0 rounded-full border border-indigo-400/30 animate-ping" />
        </span>
        {!isLast && <span className="w-px flex-1 bg-gradient-to-b from-indigo-500/40 to-transparent mt-2" />}
      </div>
      <div className="pt-1">
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-pink-300/80">{item.year}</span>
        <h4 className="text-xl md:text-2xl font-bold mt-2 mb-2">{item.title}</h4>
        <p className="text-white/50 leading-relaxed max-w-md">{item.desc}</p>
      </div>
    </motion.div>
  );
}

/** Warm pink/orange embers that drift up from the bottom of the page and flicker
 *  side to side like sparks off a fire — "lửa hồng bay tới bay lui". Purely
 *  decorative, sits low in the z-order so text always stays readable. */
function FireEmbers({ count = 22 }: { count?: number }) {
  const embers = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 3 + Math.random() * 7,
      duration: 9 + Math.random() * 10,
      delay: Math.random() * 12,
      drift: 40 + Math.random() * 90,
      hue: Math.random() > 0.5 ? "#fb7185" : "#fbbf24",
    }))
  ).current;

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {embers.map((e) => (
        <motion.span
          key={e.id}
          className="absolute rounded-full"
          style={{
            left: `${e.left}%`,
            bottom: "-5%",
            width: e.size,
            height: e.size,
            background: e.hue,
            boxShadow: `0 0 ${e.size * 2.5}px ${e.hue}`,
          }}
          animate={{
            y: ["0vh", "-115vh"],
            x: [0, e.drift, -e.drift * 0.6, 0],
            opacity: [0, 0.85, 0.85, 0],
            scale: [0.5, 1, 0.8, 0.3],
          }}
          transition={{
            duration: e.duration,
            delay: e.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAGNETIC BUTTON
// ─────────────────────────────────────────────────────────────────────────
function MagneticButton({ children, className, onClick }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });
  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 180, damping: 12, mass: 0.1 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────
function CountUp({ target }: { target: string }) {
  const numeric = parseInt(target.replace(/,/g, ""), 10);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (Number.isNaN(numeric)) return;
    let frame: number;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(numeric * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numeric]);

  if (Number.isNaN(numeric)) return <span>{target}</span>;
  return <span>{display.toLocaleString("en-US")}</span>;
}

// ─────────────────────────────────────────────────────────────────────────
// MARQUEE
// ─────────────────────────────────────────────────────────────────────────
function MarqueeText({ text, direction = 1 }: { text: string; direction?: number }) {
  return (
    <div className="relative flex overflow-hidden whitespace-nowrap bg-indigo-600/10 py-5 border-y border-indigo-500/20">
      <motion.div
        initial={{ x: direction > 0 ? 0 : "-100%" }}
        animate={{ x: direction > 0 ? "-100%" : 0 }}
        transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
        className="flex whitespace-nowrap text-3xl font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 opacity-60"
      >
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
      </motion.div>
    </div>
  );
}

/** Single expandable FAQ row with a smooth height animation and a rotating
 *  plus/minus indicator. */
function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${isOpen ? "border-indigo-400/40 bg-white/[0.06]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-6 text-left px-6 py-5">
        <span className="text-base md:text-lg font-bold text-white/90">{q}</span>
        <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen ? "bg-gradient-to-r from-indigo-500 to-pink-500 border-transparent rotate-45" : "border-white/20 text-white/60"}`}>
          <X className="w-4 h-4" style={{ display: isOpen ? "block" : "none" }} />
          <span className={isOpen ? "hidden" : "block text-lg leading-none"}>+</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="px-6 pb-6 text-white/55 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoScale = useTransform(heroScroll, [0, 1], [1, 1.15]);
  const videoOpacity = useTransform(heroScroll, [0, 1], [1, 0.05]);
  const heroTextY = useTransform(heroScroll, [0, 1], [0, 150]);

  const galaxyRef = useRef<HTMLElement>(null);
  const { scrollYProgress: galaxyScroll } = useScroll({ target: galaxyRef, offset: ["start end", "end start"] });

  const springConfig = { stiffness: 90, damping: 25, restDelta: 0.001 };
  const p1Y = useSpring(useTransform(galaxyScroll, [0, 1], [0, -200]), springConfig);
  const p2Y = useSpring(useTransform(galaxyScroll, [0, 1], [0, -350]), springConfig);
  const p3Y = useSpring(useTransform(galaxyScroll, [0, 1], [0, 200]), springConfig);
  const p4Y = useSpring(useTransform(galaxyScroll, [0, 1], [0, 250]), springConfig);
  const p5Y = useSpring(useTransform(galaxyScroll, [0, 1], [0, -120]), springConfig);
  const p6Y = useSpring(useTransform(galaxyScroll, [0, 1], [0, -300]), springConfig);
  const p7Y = useSpring(useTransform(galaxyScroll, [0, 1], [0, 120]), springConfig);

  const featuresRef = useRef<HTMLElement>(null);
  const { scrollYProgress: featuresScroll } = useScroll({ target: featuresRef, offset: ["start end", "end start"] });
  const fTextX = useTransform(featuresScroll, [0, 1], ["-25%", "25%"]);

  const aboutRef = useRef<HTMLElement>(null);
  const { scrollYProgress: aboutScroll } = useScroll({ target: aboutRef, offset: ["start end", "end start"] });
  const aboutImgY = useTransform(aboutScroll, [0, 1], [-40, 40]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#06070c] text-[#f4f4f8] overflow-x-hidden font-sans selection:bg-indigo-500/40 relative">
      <ScrollProgressBar />
      <CursorGlow />
      <AuroraBackground />
      <FireEmbers />
      <ClickBurst />

      {/* ─── BASE FLUCTUATING BLOBS (whole page) — bright, saturated, layered ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.25, 1], x: [0, 80, 0], y: [0, -60, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[-10%] w-[640px] h-[640px] bg-gradient-to-r from-purple-500/35 to-indigo-500/20 blur-[130px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1.2, 0.95, 1.2], x: [0, -90, 0], y: [0, 80, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[30%] left-[-10%] w-[540px] h-[540px] bg-gradient-to-r from-cyan-400/25 to-pink-500/25 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, 40, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] right-[20%] w-[440px] h-[440px] bg-gradient-to-r from-amber-400/25 to-orange-500/10 blur-[110px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 27, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[15%] w-[380px] h-[380px] bg-gradient-to-r from-emerald-400/20 to-teal-500/10 blur-[110px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1.1, 0.95, 1.1], x: [0, 60, 0], y: [0, -20, 0] }}
          transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[5%] right-[5%] w-[360px] h-[360px] bg-gradient-to-r from-fuchsia-400/25 to-rose-500/15 blur-[110px] rounded-full"
        />
      </div>

      {/* ─── HEADER / MEGA MENU ─── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "h-20 bg-[#030305]/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" : "h-28 bg-transparent"}`}>
        <div className="w-full h-full max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/60 group-hover:scale-110 transition-all duration-300">
              <Mic className="w-5 h-5 text-white" />
              <span className="absolute -inset-1 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-indigo-300">English Chat Club</span>
              <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-indigo-300/60 mt-1">Speak Every Day</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            <div className="group relative py-8 cursor-pointer">
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/70 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-pink-400 transition-all duration-300 flex items-center gap-1">
                Sản phẩm <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300 text-white/70 group-hover:text-pink-400" />
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[550px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <div className="bg-[#0b0c10]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl grid grid-cols-2 gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 blur-[50px]" />
                  <div>
                    <h3 className="text-[11px] font-black text-indigo-400 mb-5 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                      Tính năng
                    </h3>
                    <ul className="space-y-4">
                      <li><a href="#features" className="text-sm font-medium hover:text-white hover:translate-x-1 text-white/60 transition-all flex items-center gap-2 group/item"><span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />Phòng Hội Thoại Video</a></li>
                      <li><a href="#features" className="text-sm font-medium hover:text-white hover:translate-x-1 text-white/60 transition-all flex items-center gap-2 group/item"><span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />Hệ Thống Gamification</a></li>
                      <li><a href="#galaxy" className="text-sm font-medium hover:text-white hover:translate-x-1 text-white/60 transition-all flex items-center gap-2 group/item"><span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />Diễn Đàn Cộng Đồng</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-pink-400 mb-5 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                      Tài nguyên
                    </h3>
                    <ul className="space-y-4">
                      <li><a href="#features" className="text-sm font-medium hover:text-white hover:translate-x-1 text-white/60 transition-all flex items-center gap-2 group/item"><span className="w-1 h-1 rounded-full bg-pink-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />Thư Viện Bài Giảng</a></li>
                      <li><a href="#features" className="text-sm font-medium hover:text-white hover:translate-x-1 text-white/60 transition-all flex items-center gap-2 group/item"><span className="w-1 h-1 rounded-full bg-pink-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />Luyện Phát Âm</a></li>
                      <li><a href="#features" className="text-sm font-medium hover:text-white hover:translate-x-1 text-white/60 transition-all flex items-center gap-2 group/item"><span className="w-1 h-1 rounded-full bg-pink-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />Blog Học Thuật</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <a href="#how" className="relative text-[11px] font-bold tracking-[0.25em] uppercase text-white/70 hover:text-white transition-all duration-300 group/nav">
              Cách hoạt động
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-400 to-pink-400 group-hover/nav:w-full transition-all duration-300" />
            </a>
            <a href="#about" className="relative text-[11px] font-bold tracking-[0.25em] uppercase text-white/70 hover:text-white transition-all duration-300 group/nav">
              Về chúng tôi
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-400 to-pink-400 group-hover/nav:w-full transition-all duration-300" />
            </a>
            <a href="#galaxy" className="relative text-[11px] font-bold tracking-[0.25em] uppercase text-white/70 hover:text-white transition-all duration-300 group/nav">
              Cộng đồng
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-400 to-pink-400 group-hover/nav:w-full transition-all duration-300" />
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="px-6 py-3.5 rounded-full border border-white/15 text-[12px] font-bold tracking-[0.2em] uppercase text-white/80 hover:text-white hover:border-white/35 hover:bg-white/5 transition-all duration-300">Đăng nhập</Link>
            <Link href="/register" className="relative group overflow-hidden px-9 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[12px] font-bold tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] hover:scale-105 transition-all duration-300">
              <span className="relative z-10">Đăng Ký Ngay</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-15 transition-opacity" />
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border border-white/40"
                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6 text-pink-400" /> : <Menu className="w-6 h-6 text-indigo-400" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-[#030305] border-b border-white/10 p-6 flex flex-col gap-6 md:hidden shadow-2xl"
            >
              <a href="#features" className="text-lg font-bold hover:text-indigo-400 transition-colors">Sản phẩm</a>
              <a href="#how" className="text-lg font-bold hover:text-indigo-400 transition-colors">Cách hoạt động</a>
              <a href="#about" className="text-lg font-bold hover:text-indigo-400 transition-colors">Về chúng tôi</a>
              <a href="#galaxy" className="text-lg font-bold hover:text-indigo-400 transition-colors">Cộng đồng</a>
              <div className="h-px bg-white/10 my-2" />
              <Link href="/login" className="w-full text-center py-4 rounded-full border border-white/15 text-base font-bold text-white/80">Đăng nhập</Link>
              <Link href="/register" className="w-full text-center py-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-base font-bold text-white shadow-lg shadow-indigo-500/30">Đăng Ký Ngay</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section ref={heroRef} className="relative h-[100svh] w-full flex flex-col justify-end px-6 md:px-12 pb-12 md:pb-24 overflow-hidden z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/25 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-pink-500/15 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
        <DotGrid className="z-[1]" opacity={0.06} />

        <motion.div style={{ scale: videoScale, opacity: videoOpacity }} className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover" poster="/images/hero-bg.png">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-video-call-at-home-with-her-friends-42728-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/50 to-[#030305]/20" />
        </motion.div>

        <motion.div style={{ y: heroTextY }} className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="w-full md:w-3/4">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mb-8 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              Tiên phong giao tiếp trực tuyến
              <SoundBars className="ml-1" />
            </motion.div>

            <h1 className="text-[14vw] md:text-[10vw] leading-[0.8] font-black tracking-tighter uppercase">
              <div className="overflow-hidden">
                <motion.span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>Speak.</motion.span>
              </div>
              <div className="overflow-hidden">
                <motion.span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
                  Every Day<span className="font-serif italic normal-case font-light text-white/40">,</span>
                </motion.span>
              </div>
              <div className="overflow-hidden">
                <motion.span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-text-shimmer" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>Fluently.</motion.span>
              </div>
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            whileHover={{ y: -6 }}
            className="w-full sm:w-[360px] group flex flex-col gap-6 rounded-[2.5rem] bg-[#0c0d13]/80 backdrop-blur-2xl p-8 border border-white/10 hover:border-pink-500/40 transition-all duration-500 cursor-pointer shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 blur-xl pointer-events-none" />
            <Link href="/register" className="flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 text-indigo-200">Trải nghiệm Premium</span>
                <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-pink-500 transition-all duration-300 shadow-md">
                  <ArrowUpRight className="w-5 h-5 text-white group-hover:rotate-45 transition-transform duration-500" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-bold leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-pink-200 transition-all">Môi trường giao tiếp không giới hạn</span>
                <span className="text-sm text-white/50 leading-relaxed">Tham gia ngay hôm nay để nhận 100 điểm XP thưởng cho tân binh và mở khoá mọi câu lạc bộ.</span>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/40"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Cuộn xuống</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* ─── LIVE PULSE BAR ─── */}
      <section className="relative z-20 -mt-1 border-y border-white/10 bg-[#0d0f1a]/85 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-pink-500/10 pointer-events-none" />
        <DotGrid opacity={0.06} />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {PULSE_STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="flex items-center gap-4"
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-indigo-300" />
                </div>
                {i === 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />}
                {i === 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />}
              </div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black tabular-nums tracking-tight text-white">
                  <CountUp target={s.value} />
                </span>
                <span className="text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase text-white/40">{s.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <MarqueeText text="ENGLISH CHAT CLUB • ONLINE LEARNING • GLOBAL COMMUNITY • CEFR STANDARD • LEARN TO SPEAK • LIVE MEETINGS • " direction={-1} />

      {/* ─── STICKY FEATURES SECTION ─── */}
      <section id="features" ref={featuresRef} className="py-40 px-6 md:px-12 w-full max-w-7xl mx-auto relative overflow-hidden z-10">
        <FloatingOrbs variant="cool" />
        <motion.h2 style={{ x: fTextX }} className="text-[12vw] font-black uppercase tracking-tighter text-white/5 whitespace-nowrap absolute top-20 left-0 pointer-events-none">
          Core Features
        </motion.h2>

        <div className="relative z-10 flex flex-col md:flex-row gap-20 items-start pt-20">
          <div className="w-full md:w-1/2 sticky top-40 flex flex-col gap-8">
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
              Hệ Sinh Thái<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Đỉnh Cao</span>
            </h3>
            <p className="text-xl text-white/60 leading-relaxed font-medium">
              Không chỉ là học tiếng Anh, chúng tôi tạo ra một thế giới thu nhỏ nơi bạn sống với ngôn ngữ mỗi ngày thông qua các công cụ công nghệ tiên tiến nhất.
            </p>
            <Link href="/register" className="inline-flex items-center gap-4 text-[12px] font-bold tracking-[0.2em] uppercase mt-4 pb-2 border-b-2 border-indigo-500 hover:border-pink-400 transition-colors w-fit group">
              Khám phá toàn bộ <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-10">
            {FEATURES.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group"
              >
                <TiltCard className="bg-[#0c0d14]/80 border border-white/5 rounded-3xl p-8 hover:border-indigo-500/30 transition-colors duration-500 shadow-lg overflow-hidden">
                  <div className={`absolute -right-16 -top-16 w-32 h-32 bg-gradient-to-br ${feat.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-8 shadow-lg ${feat.shadow} ${feat.hoverShadow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <feat.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-300 transition-all">{feat.title}</h4>
                  <p className="text-white/50 leading-relaxed text-lg">{feat.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="py-32 px-6 md:px-12 w-full max-w-7xl mx-auto relative z-10 border-t border-white/5 overflow-hidden">
        <FloatingOrbs variant="warm" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 relative z-10">
          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
            Bắt Đầu Trong<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400">3 Bước.</span>
          </h3>
          <p className="text-white/50 text-lg max-w-sm">Không cần chuẩn bị gì cầu kỳ. Đăng ký, chọn phòng, và bắt đầu nói ngay trong buổi đầu tiên.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="group"
            >
              <TiltCard className={`relative bg-white/[0.045] border border-white/10 ${step.ring} rounded-3xl p-10 flex flex-col gap-6 h-full backdrop-blur-xl shadow-xl overflow-hidden transition-colors duration-500`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                <span className={`relative text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${step.numGradient} opacity-70 group-hover:opacity-100 group-hover:scale-110 origin-left transition-all duration-500`}>{step.n}</span>
                <h4 className="relative text-xl font-bold">{step.title}</h4>
                <p className="relative text-white/55 leading-relaxed">{step.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── COMMUNITY SERVICES SECTION ─── */}
      <section id="services" className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto relative z-10 border-t border-white/5 overflow-hidden">
        <FloatingOrbs variant="vivid" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {EXTRA_SERVICES.map((srv, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              whileHover={{ y: -6 }}
              className="bg-[#07080d]/60 border border-white/5 rounded-3xl p-8 hover:bg-[#0c0e18]/80 hover:border-white/10 transition-all duration-300 relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${srv.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <srv.icon className={`w-6 h-6 ${srv.color}`} />
              </div>
              <h4 className="text-xl font-bold mb-3 relative z-10">{srv.title}</h4>
              <p className="text-white/40 leading-relaxed text-sm relative z-10">{srv.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── COMMUNITY PHOTO GALLERY ─── */}
      <section id="gallery" className="py-28 px-6 md:px-12 w-full max-w-7xl mx-auto relative z-10 border-t border-white/5 overflow-hidden">
        <FloatingOrbs variant="warm" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase text-pink-300 w-fit px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Khoảnh Khắc Cộng Đồng
            </span>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
              Hình Ảnh Từ<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300">Cộng Đồng Của Chúng Tôi.</span>
            </h3>
          </div>
          <p className="text-white/50 text-lg max-w-sm">Hàng nghìn buổi trò chuyện diễn ra mỗi ngày — đây chỉ là một vài khoảnh khắc trong số đó.</p>
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-4">
          {GALLERY_IMAGES.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className={`relative rounded-2xl overflow-hidden group border border-white/10 shadow-lg ${img.span}`}
            >
              <img src={img.src} alt={img.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
              <span className="absolute bottom-3 left-3 right-3 text-xs md:text-sm font-semibold text-white/90 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">{img.caption}</span>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── GALAXY / PARTICLES SECTION ─── */}
      <section id="galaxy" ref={galaxyRef} className="relative py-40 md:py-64 overflow-hidden bg-gradient-to-b from-[#e0e0e8] to-[#c7c7d4] text-[#050505] rounded-[3rem] md:rounded-[5rem] mx-2 md:mx-6 shadow-[0_0_80px_rgba(99,102,241,0.25)] z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-gradient-to-r from-indigo-500/20 to-pink-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 perspective-[1000px]">
          <motion.div style={{ y: p1Y, rotate: -5 }} className="absolute top-[5%] left-[5%] w-[150px] h-[200px] md:w-[220px] md:h-[300px] overflow-hidden rounded-2xl shadow-2xl z-10">
            <img src={PARTICLES[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Video call luyện nói tiếng Anh" />
          </motion.div>
          <motion.div style={{ y: p2Y, rotate: 10 }} className="absolute top-[30%] right-[10%] w-[120px] h-[120px] md:w-[180px] md:h-[180px] overflow-hidden rounded-full shadow-2xl z-20">
            <img src={PARTICLES[1]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Nhóm học viên trò chuyện" />
          </motion.div>
          <motion.div style={{ y: p3Y, rotate: 5 }} className="absolute bottom-[10%] left-[15%] w-[200px] h-[150px] md:w-[300px] md:h-[220px] overflow-hidden rounded-[2rem] shadow-2xl z-10">
            <img src={PARTICLES[2]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Đeo tai nghe luyện phát âm" />
          </motion.div>
          <motion.div style={{ y: p4Y, rotate: -15 }} className="absolute top-[15%] right-[35%] w-[100px] h-[140px] md:w-[150px] md:h-[210px] overflow-hidden rounded-xl shadow-xl z-0">
            <img src={PARTICLES[3]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Bạn bè trò chuyện ngoài trời" />
          </motion.div>
          <motion.div style={{ y: p5Y, rotate: 8 }} className="absolute bottom-[20%] right-[8%] w-[180px] h-[240px] md:w-[260px] md:h-[360px] overflow-hidden rounded-[2.5rem] shadow-2xl z-30">
            <img src={PARTICLES[4]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Học viên tại quán cà phê" />
          </motion.div>
          <motion.div style={{ y: p6Y, rotate: -12 }} className="absolute top-[60%] left-[2%] w-[90px] h-[130px] md:w-[140px] md:h-[200px] overflow-hidden rounded-2xl shadow-xl z-20">
            <img src={PARTICLES[5]} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Cuộc gọi nhóm trực tuyến" />
          </motion.div>
          <motion.div style={{ y: p7Y, rotate: 3 }} className="absolute top-[5%] left-[45%] w-[110px] h-[110px] md:w-[160px] md:h-[160px] overflow-hidden rounded-full shadow-2xl z-0">
            <img src={PARTICLES[6]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Không gian học tập tại nhà" />
          </motion.div>
        </div>

        <div className="relative z-40 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center min-h-[60vh] text-center pointer-events-none mix-blend-difference text-white">
          <h2 className="text-[13vw] md:text-[9vw] leading-[0.85] font-black tracking-tighter uppercase mb-20 drop-shadow-2xl">
            <motion.span initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="block ml-[-20vw] md:ml-[-15vw]">A Community</motion.span>
            <motion.span initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} className="block text-white/50 italic font-serif my-2 md:my-0">Waiting for</motion.span>
            <motion.span initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} className="block ml-[15vw] md:ml-[10vw]">Your Voice.</motion.span>
          </h2>
          <div className="pointer-events-auto">
            <MagneticButton className="group flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:scale-105 transition-all duration-500 shadow-[0_0_40px_rgba(99,102,241,0.5)]">
              <Link href="/register" className="flex flex-col items-center gap-2">
                <span className="text-[11px] md:text-[13px] font-black tracking-[0.25em] uppercase">Tham gia</span>
                <ArrowUpRight className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ─── ABOUT US ─── */}
      <section id="about" ref={aboutRef} className="relative py-32 md:py-44 px-6 md:px-12 w-full max-w-7xl mx-auto z-10 overflow-hidden">
        <FloatingOrbs />
        <DotGrid opacity={0.05} />

        {/* Intro */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-28">
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-300 w-fit px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Target className="w-3.5 h-3.5" /> Về Chúng Tôi
            </span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
              Từ một phòng chat nhỏ<span className="font-serif italic normal-case font-light text-white/40">,</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">đến một thế giới.</span>
            </h2>
            <p className="text-white/55 text-lg leading-relaxed max-w-xl">
              English Chat Club ra đời từ một niềm tin đơn giản: cách tốt nhất để giỏi tiếng Anh là <span className="text-white/80 font-medium">nói mỗi ngày</span>, cùng những người thật, về những chủ đề bạn thật sự quan tâm. Không giáo trình cứng nhắc, không áp lực điểm số — chỉ có những cuộc trò chuyện đưa bạn tiến bộ tự nhiên.
            </p>
            <p className="text-white/55 text-lg leading-relaxed max-w-xl">
              Hôm nay, đội ngũ của chúng tôi trải khắp nhiều múi giờ để đảm bảo lúc nào cũng có một phòng đang mở, một chủ đề đang chờ, và một người bạn mới sẵn sàng trò chuyện cùng bạn.
            </p>
          </div>

          <motion.div style={{ y: aboutImgY }} className="relative">
            <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl border border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&h=1100&fit=crop"
                alt="Đội ngũ English Chat Club làm việc cùng nhau"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030305]/85 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <Heart className="w-5 h-5 text-pink-300 shrink-0" />
                <span className="text-sm text-white/80">Xây dựng bởi những người từng học tiếng Anh y như bạn.</span>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-8 hidden md:flex items-center gap-3 bg-[#0c0d14] border border-white/10 rounded-2xl px-6 py-4 shadow-2xl">
              <Quote className="w-6 h-6 text-indigo-300 shrink-0" />
              <span className="text-sm text-white/70 max-w-[220px] leading-snug">&quot;Không phải nền tảng học, mà là nơi tôi thuộc về.&quot;</span>
            </div>
          </motion.div>
        </div>

        {/* Stat strip */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mb-28 border-y border-white/10 py-10">
          {ABOUT_STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center md:text-left"
            >
              <span className="block text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">{s.value}</span>
              <span className="block text-[11px] font-bold tracking-[0.15em] uppercase text-white/40 mt-2">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Timeline + Values */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">Hành Trình Của English Chat Club</h3>
            <p className="text-sm font-bold tracking-[0.15em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300 mb-12">Tất cả diễn ra ngay trong năm 2026</p>
            <div>
              {TIMELINE.map((item, i) => (
                <TimelineRow key={item.year} item={item} index={i} isLast={i === TIMELINE.length - 1} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-12">Giá Trị Cốt Lõi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {VALUES.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group"
                >
                  <TiltCard className={`relative bg-white/[0.05] border border-white/10 ${v.ring} rounded-2xl p-6 transition-colors duration-300 h-full overflow-hidden backdrop-blur-xl shadow-lg`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${v.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                    <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${v.iconBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <v.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="relative text-base font-bold mb-2">{v.title}</h4>
                    <p className="relative text-white/55 text-sm leading-relaxed">{v.desc}</p>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SPOTLIGHT: WHY MEMBERS STAY ─── */}
      <section className="py-32 px-6 md:px-12 w-full max-w-7xl mx-auto relative z-10 overflow-hidden">
        <FloatingOrbs variant="cool" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl border border-white/10 group"
          >
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&h=1100&fit=crop"
              alt="Học viên đeo tai nghe luyện nói tiếng Anh"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030305]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <Headphones className="w-5 h-5 text-cyan-300 shrink-0" />
              <span className="text-sm text-white/80">Luyện nghe & nói song song trong mỗi buổi club.</span>
            </div>
          </motion.div>

          <div className="flex flex-col gap-8">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-amber-300">
              <Sparkles className="w-3.5 h-3.5" /> Vì sao học viên ở lại
            </span>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1.05]">
              Không phải lớp học,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">là một nơi để thuộc về.</span>
            </h3>
            <p className="text-white/55 text-lg leading-relaxed max-w-xl">
              English Chat Club không chỉ dạy ngữ pháp — chúng tôi tạo ra thói quen. Mỗi tuần bạn quay lại vì những người bạn đã quen, những chủ đề bạn tò mò, và cảm giác tiến bộ có thể đo đếm được từng ngày.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">24/7</span>
                <span className="text-xs text-white/40 uppercase tracking-wider">Phòng luôn mở</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">200+</span>
                <span className="text-xs text-white/40 uppercase tracking-wider">Chủ đề đàm thoại</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE TESTIMONIALS ─── */}
      <div className="py-24 overflow-hidden bg-[#030305] relative">
        <DotGrid opacity={0.04} />
        <div className="relative flex whitespace-nowrap">
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ repeat: Infinity, duration: 55, ease: "linear" }}
            className="flex whitespace-nowrap items-center gap-12"
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} className="flex items-center gap-6 bg-[#0c0d14]/80 rounded-full py-4.5 px-10 border border-white/5 shadow-md hover:border-pink-500/30 transition-colors duration-300">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-pink-400 text-sm">★</span>
                  ))}
                </div>
                <span className="text-lg font-medium text-white/80">&quot;{t}&quot;</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── PARTNERS STRIP ─── */}
      <div className="py-14 border-y border-white/5 bg-white/[0.02] overflow-hidden relative z-10">
        <p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase text-white/30 mb-8">Đồng hành cùng English Chat Club</p>
        <div className="relative flex whitespace-nowrap">
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="flex whitespace-nowrap items-center gap-16"
          >
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <span key={i} className="text-lg md:text-xl font-black tracking-[0.15em] text-white/25 hover:text-white/60 transition-colors duration-300">{p}</span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-32 px-6 md:px-12 w-full max-w-4xl mx-auto relative z-10 overflow-hidden">
        <FloatingOrbs variant="default" />
        <div className="relative z-10 text-center mb-16">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-300 w-fit px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <MessageSquare className="w-3.5 h-3.5" /> Câu Hỏi Thường Gặp
          </span>
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            Còn Thắc Mắc<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Trước Khi Bắt Đầu?</span>
          </h3>
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          {FAQS.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
          ))}
        </div>
      </section>

      {/* ─── HUGE CTA ─── */}
      <section className="py-36 px-6 border-t border-white/5 relative overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-indigo-600/15 blur-[160px] rounded-full pointer-events-none" />
        <DotGrid opacity={0.05} />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-[16vw] leading-[0.8] font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/10">
            Let&apos;s Talk.
          </h2>
          <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/register" className="px-14 py-5.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold tracking-[0.25em] uppercase text-xs hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] hover:scale-105 transition-all duration-300">
              Đăng ký ngay
            </Link>
            <Link href="/login" className="px-14 py-5.5 rounded-full bg-white/5 border border-white/10 text-white font-bold tracking-[0.25em] uppercase text-xs hover:bg-white/10 hover:border-pink-500/30 transition-all duration-300">
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* ─── DETAILED FOOTER ─── */}
      <footer className="bg-[#020204] pt-28 pb-12 px-6 md:px-12 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-20">
            <div className="md:col-span-4 lg:col-span-5 flex flex-col gap-6">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                <Mic className="w-8 h-8 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-2xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-indigo-400">English Chat Club</span>
              </Link>
              <p className="text-white/40 text-lg max-w-sm leading-relaxed">
                Nền tảng giao tiếp trực tuyến hàng đầu, mang thế giới đến gần bạn thông qua ngôn ngữ.
              </p>

              <div className="mt-4">
                <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/35 mb-4">Đăng ký nhận bản tin</h4>
                <div className="flex relative max-w-sm">
                  <input type="email" placeholder="Email của bạn..." className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors" />
                  <button className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center hover:scale-105 transition-transform duration-200">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-6">
              <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/35">Sản phẩm</h4>
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-sm font-medium text-white/50 hover:text-indigo-400 hover:translate-x-1 transition-all w-fit">Tính năng</a>
                <a href="#features" className="text-sm font-medium text-white/50 hover:text-indigo-400 hover:translate-x-1 transition-all w-fit">Bảng giá</a>
                <a href="#features" className="text-sm font-medium text-white/50 hover:text-indigo-400 hover:translate-x-1 transition-all w-fit">Ứng dụng di động</a>
                <a href="#features" className="text-sm font-medium text-white/50 hover:text-indigo-400 hover:translate-x-1 transition-all w-fit">Tài nguyên</a>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-6">
              <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/35">Công ty</h4>
              <div className="flex flex-col gap-4">
                <a href="#about" className="text-sm font-medium text-white/50 hover:text-indigo-400 hover:translate-x-1 transition-all w-fit">Về chúng tôi</a>
                <a href="#features" className="text-sm font-medium text-white/50 hover:text-indigo-400 hover:translate-x-1 transition-all w-fit">Tuyển dụng</a>
                <a href="#features" className="text-sm font-medium text-white/50 hover:text-indigo-400 hover:translate-x-1 transition-all w-fit">Blog</a>
                <a href="#features" className="text-sm font-medium text-white/50 hover:text-indigo-400 hover:translate-x-1 transition-all w-fit">Liên hệ</a>
              </div>
            </div>

            <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6">
              <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/35">Mạng xã hội</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gradient-to-r hover:from-indigo-500 hover:to-pink-500 hover:text-white hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-white/50 text-xs font-bold">FB</a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gradient-to-r hover:from-indigo-500 hover:to-pink-500 hover:text-white hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-white/50 text-xs font-bold">TW</a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gradient-to-r hover:from-indigo-500 hover:to-pink-500 hover:text-white hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-white/50 text-xs font-bold">IG</a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gradient-to-r hover:from-indigo-500 hover:to-pink-500 hover:text-white hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-white/50 text-xs font-bold">IN</a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/30">
              &copy; {new Date().getFullYear()} English Chat Club. All rights reserved. Built with passion.
            </p>
            <div className="flex gap-6 text-[11px] font-bold tracking-[0.1em] uppercase text-white/30">
              <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Cookies Config</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}