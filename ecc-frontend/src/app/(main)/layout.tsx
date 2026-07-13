"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useState } from "react";
import { profileService } from "@/features/profile/profileService";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if user is an ADMIN or MODERATOR
    if (user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') {
      router.push('/admin/dashboard');
      return;
    }
    
    if (user?.role === 'MODERATOR' || user?.role === 'ROLE_MODERATOR') {
      router.push('/moderator/dashboard');
      return;
    }
    
    setIsAuthorized(true);

    // Lấy thông tin profile đầy đủ để cập nhật avatar và avatarFrame
    if (user?.userId) {
      profileService.getProfileById(user.userId)
        .then((profile) => {
          useAuthStore.getState().setUser({
            ...useAuthStore.getState().user!,
            fullName: profile.fullName,
            avatarUrl: profile.avatarUrl,
            avatarFrame: profile.avatarFrame,
          });
        })
        .catch(console.error);
    }
  }, [user?.role, user?.userId, mounted, router]);

  if (!mounted || !isAuthorized) {
    return <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden relative">
      {/* Animated Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>
      
      {/* Sidebar & Main Content on top of background */}
      <div className="z-10 flex h-full w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
