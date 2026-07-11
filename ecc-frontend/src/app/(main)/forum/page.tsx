"use client";

import { useEffect, useState } from "react";
import { forumService, ForumPostResponse } from "@/features/forum/forumService";
import ForumPostCard from "@/components/shared/ForumPostCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { MessageSquare, Plus, Bookmark, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"latest" | "saved">("latest");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await forumService.getPosts({ page: 0, size: 10 });
      setPosts(data.content || data || []);
    } catch {
      toast.error("Không thể tải bài viết!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const handleLike = async (postId: number) => {
    try {
      await forumService.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, likeCount: p.likeCount + 1 } : p)
      );
    } catch (err: any) {
      toast.error("Không thể like bài viết!");
    }
  };

  const handleSave = async (postId: number) => {
    try {
      await forumService.toggleSave(postId);
      toast.success("Đã lưu bài viết");
    } catch {
      toast.error("Không thể lưu bài viết!");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
            <MessageSquare className="w-6 h-6 text-violet-400" />
            Diễn đàn
          </h1>
          <p className="text-muted-foreground text-sm">
            Chia sẻ kinh nghiệm, đặt câu hỏi và học hỏi từ cộng đồng
          </p>
        </div>
        <Link href="/forum/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tạo bài viết</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
        {[
          { id: "latest", label: "Mới nhất", icon: TrendingUp },
          { id: "saved", label: "Đã lưu", icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-violet-500 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Đang tải bài viết..." />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Chưa có bài viết nào"
          description="Hãy là người đầu tiên chia sẻ kinh nghiệm!"
          action={
            <Link href="/forum/create" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tạo bài viết đầu tiên
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <div key={post.id} className={`animate-fade-in delay-${Math.min(idx * 100, 300)}`}>
              <ForumPostCard
                post={post}
                onLike={handleLike}
                onSave={handleSave}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
