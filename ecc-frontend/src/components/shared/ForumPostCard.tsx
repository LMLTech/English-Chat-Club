"use client";

import { Heart, Bookmark, Eye, MessageCircle, Clock } from "lucide-react";
import { ForumPostResponse } from "@/features/forum/forumService";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import AuthorInfo from "./AuthorInfo";

interface ForumPostCardProps {
  post: ForumPostResponse;
  onLike?: (id: number) => void;
  onSave?: (id: number) => void;
}

export default function ForumPostCard({ post, onLike, onSave }: ForumPostCardProps) {
  const createdAt = new Date(post.createdAt);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "PENDING": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "REJECTED": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="post-card group">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <AuthorInfo authorId={post.authorId} createdAt={createdAt} />
        </div>
        <div className="flex items-center gap-1.5">
          {post.categoryName && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
              {post.categoryName}
            </span>
          )}
          <span className={`badge-pill border text-[10px] ${getStatusStyle(post.status)}`}>
            {post.status === "PUBLISHED" ? "Đã đăng" : post.status === "PENDING" ? "Chờ duyệt" : post.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <Link href={`/forum/${post.id}`} className="block group-hover:text-violet-300 transition-colors">
        <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {post.content}
        </p>
      </Link>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
        <button
          onClick={() => onLike?.(post.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            post.isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
          }`}
        >
          <Heart className="w-3.5 h-3.5" fill={post.isLiked ? "currentColor" : "none"} />
          <span>{post.likeCount}</span>
        </button>
        <Link
          href={`/forum/${post.id}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{post.commentCount} bình luận</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="w-3.5 h-3.5" />
          <span>{post.viewCount} lượt xem</span>
        </div>
        <button
          onClick={() => onSave?.(post.id)}
          className={`ml-auto flex items-center gap-1.5 text-xs transition-colors ${
            post.isSaved ? "text-violet-500" : "text-muted-foreground hover:text-violet-400"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" fill={post.isSaved ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}
