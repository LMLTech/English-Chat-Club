"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { forumService, ForumPostResponse, ForumCommentResponse } from "@/features/forum/forumService";
import { toast } from "sonner";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { MessageSquare, ThumbsUp, Bookmark, Clock, ArrowLeft, Send, User, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { profileService, UserProfileResponse } from "@/features/profile/profileService";

function CommentItem({ comment }: { comment: ForumCommentResponse }) {
  const [author, setAuthor] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    if (comment.authorId) {
      profileService.getProfileById(comment.authorId).then(setAuthor).catch(() => {});
    }
  }, [comment.authorId]);

  const displayName = author?.fullName || comment.authorName || `User ${comment.authorId}`;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex gap-4 group">
      <div className="relative w-10 h-10 flex-shrink-0">
        <div 
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold overflow-hidden"
          style={author?.avatarFrame ? { border: `2px solid ${author.avatarFrame}` } : {}}
        >
          {author?.avatarUrl ? (
            <img src={author.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
      </div>
      <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 relative">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">{displayName}</span>
            {author?.email && <span className="text-xs text-muted-foreground">({author.email})</span>}
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}

export default function ForumPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);
  const { user } = useAuthStore();
  
  const [post, setPost] = useState<ForumPostResponse | null>(null);
  const [comments, setComments] = useState<ForumCommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;
    
    Promise.all([
      forumService.getPost(postId),
      forumService.getComments(postId, { page: 0, size: 50 })
    ])
      .then(([postData, commentsData]) => {
        setPost(postData);
        setComments(commentsData.content);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Không thể tải bài viết!");
        router.push("/forum");
      })
      .finally(() => setLoading(false));
  }, [postId, router]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const comment = await forumService.addComment(postId, { content: newComment });
      setComments([comment, ...comments]);
      setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
      setNewComment("");
      toast.success("Đã thêm bình luận!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể bình luận!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      await forumService.toggleLike(postId);
      toast.success("Đã cập nhật lượt thích!");
      setPost(prev => {
        if (!prev) return prev;
        const isLiked = !prev.isLiked;
        return { ...prev, isLiked, likeCount: prev.likeCount + (isLiked ? 1 : -1) };
      });
    } catch (err) {
      toast.error("Lỗi khi thích bài viết");
    }
  };

  const handleSave = async () => {
    if (!post) return;
    try {
      await forumService.toggleSave(postId);
      setPost(prev => prev ? { ...prev, isSaved: !prev.isSaved } : prev);
      toast.success("Đã cập nhật lưu bài viết!");
    } catch (err) {
      toast.error("Lỗi khi lưu bài viết");
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Đang tải bài viết..." />;
  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/forum" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div className="flex gap-2 items-center">
          {post.categoryName && (
            <span className="badge-pill text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {post.categoryName}
            </span>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-white/10 pb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {post.authorName?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="font-medium text-foreground">{post.authorName}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date(post.createdAt).toLocaleDateString("vi-VN")}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              {post.commentCount} bình luận
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white/5 p-4 flex items-center gap-4 border-t border-white/10">
          <button onClick={handleLike} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-blue-400 transition-colors">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">{post.likeCount || 0}</span>
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-amber-400 transition-colors">
            <Bookmark className="w-4 h-4" />
            <span className="text-sm font-medium">Lưu</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-violet-400" />
          Bình luận ({post.commentCount || 0})
        </h3>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold">
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="ecc-input min-h-[80px] resize-none"
              required
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting}
                className="btn-primary flex items-center gap-2 px-4 py-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Đang gửi..." : "Gửi bình luận"}
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
