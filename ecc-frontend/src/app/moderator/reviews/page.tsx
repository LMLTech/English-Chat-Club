"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, slideIn, cn } from "@/lib/utils";
import { Star, MessageSquare, ThumbsUp, Filter, TrendingUp } from "lucide-react";

export default function ModeratorReviewsPage() {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/features/moderator/moderatorService").then(mod => {
      mod.moderatorService.getReviews()
        .then(data => setReviews(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    });
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">Đánh giá của học viên</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem phản hồi và đánh giá từ học viên sau mỗi buổi học
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0 }}
          className="glass-card rounded-xl p-6 border border-amber-500/10 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-4xl font-bold text-white">{avgRating}</p>
          <p className="text-xs text-muted-foreground mt-1">Điểm trung bình</p>
          <div className="flex justify-center mt-2 gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className={cn("w-4 h-4", i <= 4 ? "text-amber-400 fill-amber-400" : "text-white/10")} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 border border-emerald-500/10 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-4xl font-bold text-white">{reviews.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Tổng đánh giá nhận được</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6 border border-violet-500/10 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-4xl font-bold text-white">{reviews.filter((r: any) => r.rating >= 4).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Đánh giá tích cực (4-5⭐)</p>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Lọc theo sao:</span>
        {[null, 5, 4, 3, 2, 1].map(rating => (
          <button
            key={rating ?? "all"}
            onClick={() => setFilterRating(rating)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              filterRating === rating
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
            )}
          >
            {rating === null ? "Tất cả" : `${rating}⭐`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Chưa có đánh giá nào</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Khi học viên đánh giá buổi học, kết quả sẽ hiển thị ở đây</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          {(filterRating ? reviews.filter((r: any) => r.rating === filterRating) : reviews).map((review: any, idx: number) => (
            <motion.div
              key={idx}
              variants={slideIn}
              className="glass-card rounded-xl p-5 border border-white/5 hover:border-amber-500/20 transition-all duration-300"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-400 font-bold text-sm border border-amber-500/30">
                      {review.userName?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{review.userName || "Học viên"}</p>
                      <p className="text-[10px] text-muted-foreground">Lớp học: {review.sessionTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-muted-foreground">Moderator:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={`mod-${i}`} className={cn("w-3 h-3", i <= (review.moderatorRating || review.rating) ? "text-amber-400 fill-amber-400" : "text-white/10")} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">Chủ đề:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={`topic-${i}`} className={cn("w-3 h-3", i <= (review.topicRating || review.rating) ? "text-amber-400 fill-amber-400" : "text-white/10")} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-3 pl-[52px]">&ldquo;{review.comment}&rdquo;</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
