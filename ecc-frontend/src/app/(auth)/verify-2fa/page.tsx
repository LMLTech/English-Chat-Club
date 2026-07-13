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
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[380px] animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ECC</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-violet-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Xác thực 2 lớp</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Nhập mã 6 số từ ứng dụng Authenticator của bạn
          </p>

          <form onSubmit={handleVerify} className="space-y-5">
            <input
              type="text"
              inputMode="numeric"
              value={totpCode}
              onChange={handleInput}
              placeholder="000000"
              maxLength={6}
              required
              className="ecc-input text-center text-3xl tracking-[0.5em] font-mono h-14"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Xác thực</span>
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-muted-foreground mt-5">
            Không có mã?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
