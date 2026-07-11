"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/features/auth/authService";
import { Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type VerifyState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Token xác thực không hợp lệ hoặc đã hết hạn.");
      return;
    }
    authService.verifyEmail(token)
      .then((msg) => {
        setState("success");
        setMessage(msg || "Email của bạn đã được xác thực thành công!");
      })
      .catch((err: any) => {
        setState("error");
        setMessage(err.response?.data?.message || "Xác thực email thất bại. Token có thể đã hết hạn.");
      });
  }, [token]);

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[400px] animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ECC</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-2xl text-center">
          {state === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Đang xác thực...</h1>
              <p className="text-sm text-muted-foreground">Vui lòng chờ trong giây lát</p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Xác thực thành công!</h1>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <Link href="/login" className="btn-primary inline-flex items-center gap-2">
                Đăng nhập ngay
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Xác thực thất bại</h1>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <Link href="/login" className="btn-ghost inline-flex items-center gap-2">
                Quay lại đăng nhập
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
