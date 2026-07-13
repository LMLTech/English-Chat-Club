"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/features/auth/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";

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
        
        // Wait briefly for token to be persisted before profile request
        await new Promise(r => setTimeout(r, 100));

        try {
          const { profileService } = await import("@/features/profile/profileService");
          const profile = await profileService.getProfile();
          
          // Try to get role from profile, fallback to decoding JWT token
          let userRole = profile.role;
          if (!userRole) {
            const decoded = parseJwt(data.accessToken);
            userRole = decoded?.roles?.[0] || decoded?.role || 'MEMBER';
          }
          // Remove ROLE_ prefix if present for uniformity
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
          
          // Redirect based on role
          if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
            router.push("/admin/dashboard");
          } else if (userRole === 'MODERATOR' || userRole === 'ROLE_MODERATOR') {
            router.push("/moderator/dashboard");
          } else {
            router.push("/dashboard");
          }
        } catch (err) {
          console.error("Failed to fetch profile after login", err);
          // Fallback if profile fails
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
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px] animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ECC</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Chào mừng trở lại</h1>
          <p className="text-muted-foreground text-sm">
            Đăng nhập để tiếp tục hành trình học tiếng Anh của bạn
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="ecc-input"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
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
                  className="ecc-input pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-3 text-muted-foreground">Chưa có tài khoản?</span>
            </div>
          </div>

          {/* Register link */}
          <Link
            href="/register"
            className="btn-ghost w-full flex items-center justify-center gap-2 text-center"
          >
            Đăng ký ngay miễn phí
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          English Chat Club &copy; {new Date().getFullYear()} · Nền tảng luyện tiếng Anh thực tế
        </p>
      </div>
    </div>
  );
}