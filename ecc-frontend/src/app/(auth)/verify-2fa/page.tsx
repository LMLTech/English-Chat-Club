"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Shield, Sparkles } from "lucide-react";

export default function Verify2faPage() {
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempToken = sessionStorage.getItem("tempToken");
    if (!tempToken) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.verify2fa({ tempToken, totpCode });
      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
        sessionStorage.removeItem("tempToken");

        // Wait briefly for token to be persisted before profile request
        await new Promise(r => setTimeout(r, 100));

        try {
          const { profileService } = await import("@/features/profile/profileService");
          const profile = await profileService.getProfile();
          setUser({
            userId: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            role: profile.role as any,
            avatarUrl: profile.avatarUrl
          });
        } catch (err) {
          console.error("Failed to fetch profile after 2fa", err);
        }

        toast.success("Xác thực thành công! Chào mừng bạn trở lại 🎉");
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Mã OTP không đúng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setTotpCode(val);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#05050A] text-slate-200 overflow-hidden font-sans relative">
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .btn-click-effect:active { transform: scale(0.95); }
      `}} />

      {/* Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/40 blur-[120px] animate-blob-spin"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-900/30 blur-[120px] animate-blob-spin" style={{animationDelay: '7s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-[420px] animate-fade-in">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 -translate-y-full group-hover:animate-[scanline_1.5s_ease-in-out_infinite]"></div>
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 tracking-tight">ECC SECURITY</span>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 sm:p-10 text-center relative overflow-hidden">
          {/* Top glowing line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70"></div>

          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6 relative">
             <div className="absolute inset-0 rounded-full border border-indigo-400/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
             <Shield className="w-10 h-10 text-indigo-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Xác thực 2 lớp</h1>
          <p className="text-slate-400 mb-8 font-medium">
            Mở ứng dụng Authenticator và nhập mã 6 số của bạn vào bên dưới
          </p>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={totpCode}
                onChange={handleInput}
                placeholder="• • • • • •"
                maxLength={6}
                required
                className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 text-center text-4xl tracking-[0.4em] font-mono h-20 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner backdrop-blur-sm"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="btn-click-effect relative overflow-hidden w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/30"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span className="text-[16px] tracking-wide">Xác Thực Ngay</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-sm text-slate-400">
              Không có thiết bị?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Quay lại đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
