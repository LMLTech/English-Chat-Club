"use client";

import { useState, useEffect } from "react";
import { adminService, EmailCampaign } from "@/features/admin/adminService";
import { toast } from "sonner";
import { Mail, Plus, Send, RefreshCw, Image as ImageIcon } from "lucide-react";

export default function AdminMarketingPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    htmlContent: "",
    targetSegment: "{}",
    imageUrl: ""
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = () => {
    setLoading(true);
    adminService.getCampaigns()
      .then(res => setCampaigns(res || []))
      .catch(() => toast.error("Không thể tải danh sách chiến dịch"))
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.subject || !formData.htmlContent) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    
    setIsSubmitting(true);
    try {
      let finalHtml = formData.htmlContent;
      if (formData.imageUrl) {
        finalHtml = `<div style="text-align: center;"><img src="${formData.imageUrl}" alt="Campaign Image" style="max-width: 100%; border-radius: 8px; margin-bottom: 20px;" /></div>` + finalHtml;
      }
      
      const newCampaign = await adminService.createCampaign({
        title: formData.title,
        subject: formData.subject,
        htmlContent: finalHtml,
        targetSegment: formData.targetSegment
      });
      
      toast.success("Tạo chiến dịch thành công!");
      setCampaigns(prev => [newCampaign, ...prev]);
      setShowModal(false);
      setFormData({ title: "", subject: "", htmlContent: "", targetSegment: "{}", imageUrl: "" });
    } catch (err) {
      toast.error("Lỗi khi tạo chiến dịch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNow = async (id: number) => {
    try {
      toast.info("Đang xử lý gửi email...");
      await adminService.sendCampaignNow(id);
      toast.success("Chiến dịch đã được đưa vào hàng đợi gửi (Background Task)");
      fetchCampaigns();
    } catch (err) {
      toast.error("Lỗi khi gửi chiến dịch");
    }
  };

  const handleFakeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
        toast.success("Đã tải ảnh lên thành công");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-purple-400" />
            Email Marketing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý và gửi email thông báo, sự kiện cho học viên</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCampaigns} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/10">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 flex items-center gap-2 text-sm font-medium text-white transition-colors shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" /> Tạo chiến dịch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
           <div className="col-span-full p-12 flex justify-center"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : campaigns.length === 0 ? (
           <div className="col-span-full p-12 flex justify-center text-muted-foreground text-sm glass-card rounded-2xl border border-white/5">Chưa có chiến dịch nào.</div>
        ) : (
          campaigns.map(camp => (
            <div key={camp.id} className="glass-card rounded-2xl border border-white/5 p-5 flex flex-col group relative overflow-hidden hover:border-purple-500/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-3 relative">
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                  camp.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-400' :
                  camp.status === 'SENDING' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-white/10 text-muted-foreground'
                }`}>
                  {camp.status || 'DRAFT'}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(camp.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 relative truncate" title={camp.title}>{camp.title}</h3>
              <p className="text-sm text-purple-200/60 mb-4 relative truncate" title={camp.subject}>{camp.subject}</p>
              
              <div className="mt-auto pt-4 border-t border-white/5 flex gap-2 relative">
                {camp.status !== 'SENT' && camp.status !== 'SENDING' && (
                  <button 
                    onClick={() => handleSendNow(camp.id)}
                    className="flex-1 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-purple-500/20"
                  >
                    <Send className="w-3 h-3" /> Gửi ngay
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12141c] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Tạo chiến dịch mới</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto styled-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tiêu đề (Nội bộ)</label>
                <input 
                  type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="VD: Khuyến mãi mùa hè 2026"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chủ đề Email (Subject)</label>
                <input 
                  type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Khuyến mãi 50% các khóa học hè!"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hình ảnh quảng cáo (URL hoặc Tải lên)</label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {formData.imageUrl && (
                      <img src={formData.imageUrl} alt="Preview" className="h-10 w-10 object-cover rounded-md border border-white/10" />
                    )}
                    <input 
                      type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="Dán đường dẫn (URL) ảnh public từ Google Drive, Imgur, Facebook..."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground italic">Lưu ý: Không dùng ảnh từ máy tính. Bạn phải up ảnh lên một trang web (VD: Imgur, Facebook) rồi copy link hình ảnh dán vào đây để Gmail có thể hiển thị được.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nội dung HTML</label>
                <textarea 
                  value={formData.htmlContent} onChange={e => setFormData({...formData, htmlContent: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 min-h-[150px] font-mono"
                  placeholder="<h1>Chào bạn!</h1><br><p>Lưu ý dùng các thẻ HTML như <br> hoặc <p> để xuống dòng...</p>"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phân khúc gửi (Đối tượng nhận)</label>
                <div className="relative">
                  <select 
                    value={formData.targetSegment} 
                    onChange={e => setFormData({...formData, targetSegment: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                  >
                    <option value='{}' className="bg-[#12141c]">Tất cả người dùng (All Users)</option>
                    <option value='"MEMBER"' className="bg-[#12141c]">Chỉ Học viên (Members)</option>
                    <option value='"MODERATOR"' className="bg-[#12141c]">Chỉ Điều phối viên (Moderators)</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleCreate}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-sm font-medium text-white transition-colors shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
