"use client";

import { useState, useEffect } from "react";
import { adminService, AdminTopicResponse, AdminTopicRequest } from "@/features/admin/adminService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Edit2, Trash2, Power, X } from "lucide-react";
import { staggerContainer, slideIn, scaleUp } from "@/lib/utils";

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<AdminTopicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<AdminTopicResponse | null>(null);
  
  const [form, setForm] = useState<AdminTopicRequest>({
    title: "",
    description: "",
    imageUrl: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await adminService.getTopics();
      setTopics(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi tải Topics");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (topic?: AdminTopicResponse) => {
    if (topic) {
      setEditTopic(topic);
      setForm({ title: topic.title, description: topic.description, imageUrl: topic.imageUrl });
    } else {
      setEditTopic(null);
      setForm({ title: "", description: "", imageUrl: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editTopic) {
        await adminService.updateTopic(editTopic.id, form);
        toast.success("Cập nhật Topic thành công!");
      } else {
        await adminService.createTopic(form);
        toast.success("Tạo Topic mới thành công!");
      }
      setModalOpen(false);
      fetchTopics();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lưu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa Topic này không?")) return;
    try {
      await adminService.deleteTopic(id);
      toast.success("Đã xóa Topic!");
      fetchTopics();
    } catch (err: any) {
      toast.error("Không thể xóa Topic này");
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await adminService.toggleTopicStatus(id);
      toast.success("Đã thay đổi trạng thái!");
      fetchTopics();
    } catch (err: any) {
      toast.error("Lỗi khi thay đổi trạng thái");
    }
  };

  if (loading) return <div className="mt-20"><LoadingSpinner size="lg" text="Đang tải danh sách Topics..." /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-violet-400" />
            Quản lý Topics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các chủ đề học của hệ thống</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm Topic Mới
        </button>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map(topic => (
          <motion.div key={topic.id} variants={scaleUp} className="glass-card rounded-2xl overflow-hidden border border-white/5 group hover:border-violet-500/30 transition-all relative">
            <div className="h-32 bg-black/40 overflow-hidden relative">
              {topic.imageUrl ? (
                <img src={topic.imageUrl} alt={topic.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-violet-500/20">No Image</div>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => handleToggle(topic.id)} className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md ${topic.isActive ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-bold text-white mb-2">{topic.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">{topic.description}</p>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className={`text-xs font-medium px-2 py-1 rounded ${topic.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {topic.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                </span>
                
                <div className="flex gap-2">
                  <button onClick={() => openModal(topic)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-violet-500/20 text-muted-foreground hover:text-violet-400 flex items-center justify-center transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(topic.id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 flex items-center justify-center transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg bg-[#1a1d2d] rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editTopic ? "Chỉnh sửa Topic" : "Thêm Topic Mới"}</h2>
                <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Tiêu đề</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="ecc-input" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Mô tả</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required className="ecc-input resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">URL Hình ảnh</label>
                  <input type="url" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="ecc-input" />
                </div>
                
                <button type="submit" disabled={submitting} className="btn-primary w-full mt-6 py-3">
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
