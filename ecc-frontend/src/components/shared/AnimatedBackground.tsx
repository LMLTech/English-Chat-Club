"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#0a0a0f]">
      {/* Dynamic Gradients (CSS Animated instead of Framer Motion for performance) */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse"
        style={{ animationDuration: '6s', animationDelay: '1s' }}
      />

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />
    </div>
  );
}
