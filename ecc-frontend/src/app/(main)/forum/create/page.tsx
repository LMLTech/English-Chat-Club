"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forumService, ForumCategoryResponse } from "@/features/forum/forumService";
import { toast } from "sonner";
import { MessageSquare, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function CreateForumPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<ForumCategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    forumService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 5) {
      toast.error("Tiêu đề phải có ít nhất 5 ký tự!");
      return;
    }
    if (content.trim().length < 20) {
      toast.error("Nội dung phải có ít nhất 20 ký tự!");
      return;
    }
    if (!categoryId) {
      toast.error("Vui lòng chọn chủ đề!");
      return;
    }
    setLoading(true);
    try {
      const post = await forumService.createPost({ title, content, categoryId });
      toast.success("Bài viết đã được đăng thành công!");
      router.push(`/forum/${post.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể đăng bài viết. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/forum" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            Tạo bài viết mới
          </h1>
          <p className="text-sm text-muted-foreground">Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng</p>
        </div>
      </div>

      {/* Form */}
      <div className="glass-card rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground/80">
              Tiêu đề bài viết <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="ecc-input text-base font-medium"
              maxLength={200}
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">{title.length}/200</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground/80">
              Chủ đề bài viết <span className="text-red-400">*</span>
            </label>
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
              className="ecc-input"
            >
              <option value="" disabled>-- Chọn chủ đề --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground/80">
              Nội dung <span className="text-red-400">*</span>
            </label>
            <textarea
              placeholder="Viết nội dung bài viết của bạn tại đây... (Hỗ trợ Markdown)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={14}
              className="ecc-input resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Tối thiểu 20 ký tự</span>
              <span className="text-xs text-muted-foreground">{content.length} ký tự</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/forum" className="btn-ghost flex-1 flex items-center justify-center gap-2">
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Đăng bài viết</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="glass-card rounded-xl p-5 border-violet-500/10">
        <h3 className="text-sm font-semibold text-foreground mb-3">💡 Gợi ý viết bài hay</h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">•</span>
            Tiêu đề ngắn gọn, rõ ràng và hấp dẫn
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">•</span>
            Chia sẻ kinh nghiệm thực tế, ví dụ cụ thể
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">•</span>
            Đặt câu hỏi rõ ràng để nhận phản hồi tốt nhất
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">•</span>
            Tôn trọng cộng đồng, tránh nội dung tiêu cực
          </li>
        </ul>
      </div>
    </div>
  );
}
