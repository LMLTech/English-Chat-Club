"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { profileService } from "@/features/profile/profileService";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Sparks state for background animation
  const [sparks, setSparks] = useState<Array<{id: number, left: string, size: number, delay: string, duration: string}>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate sparks
    const newSparks = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 2,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 6 + 4}s`
    }));
    setSparks(newSparks);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if user is an ADMIN or MODERATOR
    if (user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') {
      if (!pathname?.includes('/room')) {
        router.push('/admin/dashboard');
        return;
      }
    }
    
    if (user?.role === 'MODERATOR' || user?.role === 'ROLE_MODERATOR') {
      if (!pathname?.includes('/room')) {
        router.push('/moderator/dashboard');
        return;
      }
    }
    
    setIsAuthorized(true);

    // Fetch full profile info for avatar
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
  }, [user?.role, user?.userId, mounted, router, pathname]);

  if (!mounted || !isAuthorized) {
    return <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="flex h-screen bg-[#05050A] overflow-hidden relative font-sans text-slate-200">
      
      {/* Global Animations & Fire Effects */}
      <style dangerouslySetInnerHTML={{__html: `
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
        @keyframes float-img {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-blob-spin { animation: blob-spin 25s linear infinite; }
        .animate-float-img { animation: float-img 6s ease-in-out infinite; }
        .glass-panel { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
      `}} />

      {/* Deep Animated Mesh Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
        {/* Giant glowing orbs for gradient mesh effect */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/40 blur-[120px] animate-blob-spin"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/30 blur-[120px] animate-blob-spin" style={{animationDelay: '7s'}}></div>
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[100px] animate-blob-spin" style={{animationDelay: '14s'}}></div>
        
        {/* Fire Sparks (Embers) */}
        {sparks.map(spark => (
          <div 
            key={spark.id}
            className="absolute bottom-0 rounded-full bg-gradient-to-t from-violet-500 via-fuchsia-400 to-cyan-200"
            style={{
              left: spark.left,
              width: spark.size,
              height: spark.size * 2,
              opacity: 0,
              filter: 'blur(1px)',
              boxShadow: '0 0 10px 2px rgba(167, 139, 250, 0.6)',
              animation: `spark-rise ${spark.duration} ease-in ${spark.delay} infinite`
            }}
          />
        ))}
      </div>
      
      {/* Sidebar & Main Content on top of background */}
      <div className="z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
