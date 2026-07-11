"use client";

import { useEffect, useState } from "react";
import { forumService, ForumPostResponse } from "@/features/forum/forumService";
import ForumPostCard from "@/components/shared/ForumPostCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { MessageSquare, Plus, Bookmark, TrendingUp } from "lucide-react";
import Link from "next/link";

const MOCK_POSTS: ForumPostResponse[] = [
  {
    id: 1,
    title: "Tips để cải thiện phát âm tiếng Anh nhanh nhất",
    content: "Sau nhiều năm học tiếng Anh, mình đã tổng hợp được những tips hiệu quả nhất để cải thiện phát âm...",
    authorId: 1,
    authorName: "Nguyễn Văn A",
    categoryId: 1,
    categoryName: "Phát âm",
    status: "PUBLISHED",
    likeCount: 42,
    commentCount: 15,
    viewCount: 320,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 2,
    title: "Chia sẻ kinh nghiệm thi IELTS đạt 7.5",
    content: "Mình vừa nhận kết quả IELTS 7.5 sau 6 tháng luyện tập. Xin chia sẻ lộ trình và tài liệu đã sử dụng...",
    authorId: 2,
    authorName: "Trần Thị B",
    categoryId: 2,
    categoryName: "IELTS",
    status: "PUBLISHED",
    likeCount: 88,
    commentCount: 34,
    viewCount: 1250,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 3,
    title: "Hỏi về cách dùng 'Would' và 'Could' trong tiếng Anh",
    content: "Mình hay nhầm lẫn giữa would và could trong các tình huống giả định. Mọi người có thể giải thích không ạ?",
    authorId: 3,
    authorName: "Lê Thị C",
    categoryId: 3,
    categoryName: "Ngữ pháp",
    status: "PUBLISHED",
    likeCount: 23,
    commentCount: 8,
    viewCount: 180,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 4,
    title: "Podcast tiếng Anh hay nhất cho người học trình độ B1-B2",
    content: "Mình tổng hợp 10 podcast tiếng Anh chất lượng cao, phù hợp cho người học trình độ B1 đến B2...",
    authorId: 4,
    authorName: "Phạm Văn D",
    categoryId: 4,
    categoryName: "Tài nguyên",
    status: "PUBLISHED",
    likeCount: 65,
    commentCount: 20,
    viewCount: 890,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPostResponse[]>(MOCK_POSTS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"latest" | "saved">("latest");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await forumService.getPosts({ page: 0, size: 10 });
      if (data.content.length > 0) {
        setPosts(data.content);
      }
    } catch {
      // Use mock data on error
    } finally {
      setLoading(false);
    }
  };

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
