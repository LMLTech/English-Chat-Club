"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Mail, Edit3, Loader2, Image as ImageIcon, Paperclip, X } from "lucide-react";
import axiosInstance from "@/lib/axios";

export default function EmailMarketingPage() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetAudience, setTargetAudience] = useState("ALL");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) {
      toast.error("Vui lòng nhập đủ tiêu đề và nội dung email");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Tạo chiến dịch
      const res = await axiosInstance.post('/api/content/campaigns', {
        subject,
        contentHtml: attachedImage ? `<img src="${attachedImage}" style="max-width: 100%; border-radius: 8px;" /><br/>${content}` : content,
        targetAudience: targetAudience
      });
      const campaignId = res.data.data.id;

      // 2. Gửi ngay lập tức
      await axiosInstance.post(`/api/content/campaigns/${campaignId}/send-now`);
      
      toast.success("Chiến dịch Email đã được tạo và đang gửi ngầm!");
      setSubject("");
      setContent("");
      setAttachedImage(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi gửi chiến dịch Email");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn một tệp hình ảnh hợp lệ.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
        toast.success("Đã đính kèm ảnh thành công!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <Mail className="w-6 h-6 text-pink-400" />
          Email Marketing
        </h1>
        <p className="text-sm text-muted-foreground">Tạo và gửi chiến dịch email hàng loạt đến toàn bộ học viên</p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/5 max-w-4xl">
        <form onSubmit={handleSendCampaign} className="space-y-6">
          
          {/* Target Audience */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-pink-400" /> Đối tượng nhận Email
            </label>
            <select 
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="ecc-input w-full"
            >
              <option value="ALL">Tất cả thành viên</option>
              <option value="MEMBER">Chỉ Học viên (Members)</option>
              <option value="MODERATOR">Chỉ Người điều phối (Moderators)</option>
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-pink-400" /> Tiêu đề Email
            </label>
            <input 
              type="text" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Nhập tiêu đề hấp dẫn..." 
              className="ecc-input w-full"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-pink-400" /> Nội dung Email (Hỗ trợ HTML)
              </label>
              
              {/* Toolbar */}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors border border-white/10">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Chèn ảnh
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors border border-white/10">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-400" /> Đính kèm tệp
                </button>
              </div>
            </div>
            
            {/* Image Preview */}
            {attachedImage && (
              <div className="relative w-fit mb-3 group mt-2">
                <img src={attachedImage} alt="Attachment Preview" className="h-32 rounded-lg border border-white/20 object-cover" />
                <button 
                  type="button" 
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <textarea 
              rows={12}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="<h1>Xin chào các bạn</h1><p>Hôm nay chúng ta có ưu đãi đặc biệt...</p>"
              className="ecc-input w-full font-mono text-sm resize-y"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Lưu ý: Nội dung sẽ được gửi dưới định dạng HTML. Hãy kiểm tra kỹ các thẻ trước khi gửi.
            </p>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary bg-pink-600 hover:bg-pink-700 shadow-[0_0_15px_rgba(219,39,119,0.4)] flex items-center gap-2 px-8 py-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Gửi chiến dịch ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
