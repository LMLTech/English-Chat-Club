"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/features/auth/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Eye, EyeOff, MessageCircle, Globe, Mic, ArrowRight, Flame } from "lucide-react";

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Create sparks for the background
  const [sparks, setSparks] = useState<Array<{id: number, left: string, size: number, delay: string, duration: string}>>([]);

  useEffect(() => {
    const newSparks = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 5 + 5}s`
    }));
    setSparks(newSparks);
  }, []);

  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.toLowerCase())) {
      toast.error("Hệ thống chỉ hỗ trợ tài khoản @gmail.com!");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.login({ email, password });

      if (data.require2fa) {
        toast.info("Tài khoản đang bật 2FA. Vui lòng nhập mã OTP!");
        sessionStorage.setItem("tempToken", data.tempToken || "");
        router.push("/verify-2fa");
      } else if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
        
        await new Promise(r => setTimeout(r, 100));

        try {
          const { profileService } = await import("@/features/profile/profileService");
          const profile = await profileService.getProfile();
          
          let userRole = profile.role;
          if (!userRole) {
            const decoded = parseJwt(data.accessToken);
            userRole = decoded?.roles?.[0] || decoded?.role || 'MEMBER';
          }
          
          userRole = (userRole || '').toUpperCase();
          if (userRole.startsWith('ROLE_')) {
            userRole = userRole.replace('ROLE_', '');
          }

          setUser({
            userId: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            role: userRole as any,
            avatarUrl: profile.avatarUrl
          });
          document.cookie = `ecc_role=${userRole}; path=/; max-age=86400`;

          toast.success("Đăng nhập thành công! Chào mừng bạn trở lại 🎉");
          
          if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
            router.push("/admin/dashboard");
          } else if (userRole === 'MODERATOR' || userRole === 'ROLE_MODERATOR') {
            router.push("/moderator/dashboard");
          } else {
            router.push("/dashboard");
          }
        } catch (err) {
          console.error("Failed to fetch profile after login", err);
          toast.success("Đăng nhập thành công! Chào mừng bạn trở lại 🎉");
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại. Kiểm tra lại thông tin!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-[#05050A] text-slate-200 overflow-hidden font-sans relative">
      
      {/* CSS Animations for Fire & Background */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-img {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes blob-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes spark-rise {
          0% { transform: translateY(100vh) translateX(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-20vh) translateX(50px) scale(0); opacity: 0; }
        }
        @keyframes fire-pulse {
          0%, 100% { box-shadow: 0 0 20px 2px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(249, 115, 22, 0.2); }
          50% { box-shadow: 0 0 40px 8px rgba(249, 115, 22, 0.6), inset 0 0 20px rgba(234, 179, 8, 0.4); }
        }
        .animate-float-img { animation: float-img 6s ease-in-out infinite; }
        .animate-blob-spin { animation: blob-spin 25s linear infinite; }
        .btn-click-effect:active { transform: scale(0.92); }
        .fire-input:focus { animation: fire-pulse 2s infinite; border-color: #f97316; }
      `}} />

      {/* Deep Animated Mesh Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        {/* Giant glowing orbs for gradient mesh effect */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/60 blur-[120px] animate-blob-spin"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-900/40 blur-[120px] animate-blob-spin" style={{animationDelay: '7s'}}></div>
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-rose-900/30 blur-[100px] animate-blob-spin" style={{animationDelay: '14s'}}></div>
        
        {/* Fire Sparks (Embers) */}
        {sparks.map(spark => (
          <div 
            key={spark.id}
            className="absolute bottom-0 rounded-full bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200"
            style={{
              left: spark.left,
              width: spark.size,
              height: spark.size * 2,
              opacity: 0,
              filter: 'blur(1px)',
              boxShadow: '0 0 10px 2px rgba(249, 115, 22, 0.8)',
              animation: `spark-rise ${spark.duration} ease-in ${spark.delay} infinite`
            }}
          />
        ))}
      </div>

      {/* Main Glassmorphic Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden lg:h-[750px]">
        
        {/* Left Panel - Visuals */}
        <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-white/10 bg-gradient-to-br from-indigo-950/40 to-black/20">
          
          <div className="mb-4 text-center z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-indigo-400 mb-2 tracking-tight drop-shadow-lg flex items-center justify-center gap-3">
              <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
              English Chat Club
            </h1>
          </div>
          
          {/* Main Illustration Floating */}
          <div className="relative w-full max-w-[320px] lg:max-w-md aspect-square my-6 animate-float-img z-10">
            {/* Inner glow behind the image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-indigo-500 rounded-full blur-[70px] opacity-20"></div>
            <Image 
              src="/login-bg.png" 
              alt="Login Illustration" 
              fill 
              className="object-contain drop-shadow-[0_20px_50px_rgba(249,115,22,0.2)] z-10" 
              priority
            />
          </div>
          
          <p className="text-lg text-slate-300 font-medium leading-relaxed mb-8 text-center z-10 max-w-sm">
            Nơi kết nối đam mê, xóa bỏ rào cản ngôn ngữ. 
            Thắp sáng ngọn lửa học tập của bạn.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 z-10">
            <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-white flex items-center gap-2 shadow-lg hover:bg-white/10 transition-colors cursor-default">
              <Globe className="w-4 h-4 text-blue-400" /> Mạng lưới toàn cầu
            </div>
            <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-white flex items-center gap-2 shadow-lg hover:bg-white/10 transition-colors cursor-default">
              <Mic className="w-4 h-4 text-rose-400" /> Giao tiếp thực tế
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-gradient-to-bl from-black/40 to-indigo-950/20">
          <div className="w-full max-w-[400px] animate-fade-in space-y-8 relative z-10">
            
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center justify-center lg:justify-start gap-2">
                Đăng nhập 
              </h2>
              <p className="text-slate-400">Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục.</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2 group">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 transition-colors group-focus-within:text-orange-400">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="fire-input w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner backdrop-blur-sm"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 transition-colors group-focus-within:text-orange-400">
                    Mật khẩu
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="fire-input w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner backdrop-blur-sm pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-400 transition-all active:scale-75 p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-click-effect relative overflow-hidden w-full py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 via-rose-600 to-indigo-600 hover:from-orange-500 hover:via-rose-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed border border-orange-500/30"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span className="text-[15px] tracking-wide">Bùng cháy đam mê (Đăng nhập)</span>
                    <Flame className="w-5 h-5 group-hover:scale-125 group-hover:text-yellow-300 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-4 border-t border-white/5">
              <p className="text-slate-400">
                Chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="text-rose-400 hover:text-rose-300 font-semibold transition-colors hover:underline flex items-center justify-center gap-1 mt-2"
                >
                  Đăng ký thành viên ngay <ArrowRight className="w-4 h-4" />
                </Link>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}