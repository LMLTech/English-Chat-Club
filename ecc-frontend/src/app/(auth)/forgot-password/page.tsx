"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/features/auth/authService";
import { toast } from "sonner";
import { Mail, ArrowLeft, Send, Sparkles, Flame, Key, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success("Hướng dẫn đặt lại mật khẩu đã được gửi đến email!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi email. Vui lòng thử lại!");
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
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-indigo-400 mb-2 tracking-tight drop-shadow-lg flex items-center justify-center gap-3">
              <ShieldCheck className="w-10 h-10 text-orange-400 animate-pulse" />
              Khôi Phục ECC
            </h1>
          </div>
          
          {/* Main Illustration Floating */}
          <div className="relative w-full max-w-[320px] lg:max-w-md aspect-square my-6 animate-float-img z-10">
            {/* Inner glow behind the image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-full blur-[70px] opacity-20"></div>
            <Image 
              src="/forgot-password-bg.png" 
              alt="Forgot Password Illustration" 
              fill 
              className="object-contain drop-shadow-[0_20px_50px_rgba(245,158,11,0.3)] z-10" 
              priority
            />
          </div>
          
          <p className="text-lg text-slate-300 font-medium leading-relaxed mb-8 text-center z-10 max-w-sm">
            Bảo mật tuyệt đối, khôi phục dễ dàng. Giữ an toàn cho tài khoản của bạn.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 z-10">
            <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-white flex items-center gap-2 shadow-lg hover:bg-white/10 transition-colors cursor-default">
              <Key className="w-4 h-4 text-amber-400" /> Đặt lại nhanh chóng
            </div>
            <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-white flex items-center gap-2 shadow-lg hover:bg-white/10 transition-colors cursor-default">
              <Mail className="w-4 h-4 text-rose-400" /> Xác thực an toàn
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-gradient-to-bl from-black/40 to-indigo-950/20">
          <div className="w-full max-w-[400px] animate-fade-in space-y-6 relative z-10">
            
            {sent ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-float-img">
                  <Mail className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Email đã được gửi!</h2>
                <p className="text-slate-300">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong className="text-orange-400 font-semibold">{email}</strong>. Vui lòng kiểm tra hộp thư của bạn (kể cả hộp thư rác).
                </p>
                <Link 
                  href="/login" 
                  className="btn-click-effect inline-flex items-center justify-center gap-2 w-full py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all border border-emerald-500/30 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Về trang đăng nhập
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center justify-center lg:justify-start gap-2">
                    Quên mật khẩu?
                  </h2>
                  <p className="text-slate-400">Đừng lo lắng! Nhập email của bạn để nhận mã khôi phục.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                  <div className="space-y-2 group">
                    <label className="block text-sm font-medium text-slate-300 transition-colors group-focus-within:text-orange-400">
                      Email khôi phục
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-400 transition-colors" />
                      <input
                        type="email"
                        placeholder="name@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="fire-input w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-click-effect relative overflow-hidden w-full py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 hover:from-orange-500 hover:via-amber-500 hover:to-rose-500 focus:outline-none focus:ring-4 focus:ring-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed border border-orange-500/30"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[15px] tracking-wide">Gửi mã khôi phục</span>
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-6 border-t border-white/5 mt-8">
                  <Link
                    href="/login"
                    className="text-slate-400 hover:text-white font-semibold transition-colors flex items-center justify-center gap-2 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Quay lại Đăng nhập
                  </Link>
                </div>
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
