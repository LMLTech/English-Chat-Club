"use client";

import { useEffect, useState } from "react";
import { rewardService, RewardItemResponse } from "@/features/rewards/rewardService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { Gift, Sparkles, Coins, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, fadeIn, scaleUp, cn } from "@/lib/utils";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<RewardItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);

  useEffect(() => {
    rewardService.getRewards(0, 50)
      .then((data) => setRewards(data.content || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (item: RewardItemResponse) => {
    if (!item.isAvailable || item.stockQuantity <= 0) return;
    
    setRedeeming(item.id);
    try {
      await rewardService.redeemReward({ rewardItemId: item.id });
      toast.success(`Đổi quà "${item.name}" thành công!`);
      // Update local stock
      setRewards(prev => prev.map(r => r.id === item.id ? { ...r, stockQuantity: r.stockQuantity - 1 } : r));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đổi quà thất bại. Có thể bạn không đủ điểm.");
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Đang tải danh sách quà tặng..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 lg:p-12 bg-gradient-to-br from-violet-600/20 via-blue-600/20 to-cyan-600/20 border border-white/10"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Gift className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-violet-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Reward Store</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Đổi điểm nhận <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">quà tặng</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Sử dụng điểm tích lũy từ việc học tập để đổi lấy các phần quà hấp dẫn, voucher và tài nguyên Premium.
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-violet-400" />
            Tất cả phần quà
          </h2>
        </div>

        {rewards.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="Chưa có quà tặng nào"
            description="Cửa hàng quà tặng đang được cập nhật. Vui lòng quay lại sau!"
          />
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {rewards.map((item) => (
              <motion.div
                key={item.id}
                variants={scaleUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-violet-500/30 transition-colors flex flex-col h-full"
              >
                {/* Image Area */}
                <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-white/2 relative overflow-hidden flex items-center justify-center p-6">
                  <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <Gift className="w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-500 group-hover:text-violet-400/50" />
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white">
                      {item.type}
                    </span>
                  </div>
                  
                  {(!item.isAvailable || item.stockQuantity <= 0) && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                        Hết hàng
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-violet-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {item.description || "Phần quà đặc biệt từ English Chat Club"}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                      <Coins className="w-4 h-4" />
                      <span>{item.pointsCost.toLocaleString()}</span>
                    </div>
                    
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={!item.isAvailable || item.stockQuantity <= 0 || redeeming === item.id}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                        (!item.isAvailable || item.stockQuantity <= 0)
                          ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                          : "bg-white text-black hover:bg-violet-400 hover:text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(167,139,250,0.5)] active:scale-95"
                      )}
                    >
                      {redeeming === item.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        "Đổi ngay"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
