"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Mail, Edit3, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";

export default function EmailMarketingPage() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

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
        contentHtml: content,
        targetAudience: "ALL"
      });
      const campaignId = res.data.data.id;

      // 2. Gửi ngay lập tức
      await axiosInstance.post(`/api/content/campaigns/${campaignId}/send-now`);
      
      toast.success("Chiến dịch Email đã được tạo và đang gửi ngầm!");
      setSubject("");
      setContent("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi gửi chiến dịch Email");
    } finally {
      setLoading(false);
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
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-pink-400" /> Nội dung Email (Hỗ trợ HTML)
            </label>
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
