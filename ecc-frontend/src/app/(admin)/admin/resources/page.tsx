"use client";

import { useState, useEffect } from "react";
import { contentService, LearningResourceResponse } from "@/features/content/contentService";
import { toast } from "sonner";
import { Library, Search, Plus, ExternalLink, Edit, Trash2, Video, BookOpen, FileText, Globe } from "lucide-react";

const CATEGORIES = ["GRAMMAR", "VOCABULARY", "SPEAKING", "LISTENING", "READING", "WRITING", "IELTS", "TOEIC"];
const TYPES = ["VIDEO", "PODCAST", "PDF", "LINK"];

const getTypeIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case "VIDEO": return Video;
    case "PODCAST": return BookOpen;
    case "PDF": return FileText;
    default: return Globe;
  }
};

const getTypeColor = (type: string) => {
  switch (type?.toUpperCase()) {
    case "VIDEO": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "PODCAST": return "text-green-400 bg-green-500/10 border-green-500/20";
    case "PDF": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    default: return "text-blue-400 bg-blue-500/10 border-blue-500/20";
  }
};

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<LearningResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResourceResponse | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("VIDEO");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("GRAMMAR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchResources = () => {
    setLoading(true);
    contentService.getResources({ page: 0, size: 50 })
      .then(res => {
        setResources(res.content || (res as any) || []);
      })
      .catch(() => toast.error("Lỗi khi tải danh sách tài nguyên"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const openModal = (resource?: LearningResourceResponse) => {
    if (resource) {
      setEditingResource(resource);
      setTitle(resource.title);
      setType(resource.type);
      setUrl(resource.url);
      setCategory(resource.category);
    } else {
      setEditingResource(null);
      setTitle("");
      setType("VIDEO");
      setUrl("");
      setCategory("GRAMMAR");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setIsSubmitting(true);
    try {
      const data = { title, type, url, category };
      if (editingResource) {
        await contentService.updateResource(editingResource.id, data);
        toast.success("Cập nhật tài nguyên thành công!");
      } else {
        await contentService.createResource(data);
        toast.success("Thêm tài nguyên thành công!");
      }
      closeModal();
      fetchResources();
    } catch (err) {
      toast.error(editingResource ? "Lỗi khi cập nhật tài nguyên" : "Lỗi khi thêm tài nguyên");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài nguyên này?")) return;
    try {
      await contentService.deleteResource(id);
      toast.success("Đã xóa tài nguyên!");
      fetchResources();
    } catch (err) {
      toast.error("Lỗi khi xóa tài nguyên");
    }
  };

  const filtered = resources.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
            <Library className="w-6 h-6 text-emerald-400" />
            Quản lý Tài nguyên
          </h1>
          <p className="text-sm text-muted-foreground">Thêm, sửa, xóa các tài liệu, video học tập cho member</p>
        </div>
        
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2 px-6 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Thêm Tài nguyên
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 bg-white/5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài nguyên theo tên hoặc danh mục..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Tên Tài nguyên</th>
                  <th className="px-6 py-3 font-medium">Danh mục</th>
                  <th className="px-6 py-3 font-medium">Loại</th>
                  <th className="px-6 py-3 font-medium">URL</th>
                  <th className="px-6 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(resource => {
                  const TypeIcon = getTypeIcon(resource.type);
                  const typeStyle = getTypeColor(resource.type);
                  
                  return (
                    <tr key={resource.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white line-clamp-2">{resource.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border bg-white/5 text-white/80 border-white/10">
                          {resource.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border ${typeStyle}`}>
                          <TypeIcon className="w-3 h-3" />
                          {resource.type}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{resource.url}</span>
                        </a>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openModal(resource)}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(resource.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Không tìm thấy tài nguyên nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12141c] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingResource ? "Cập nhật Tài nguyên" : "Thêm Tài nguyên mới"}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-white transition-colors">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">Tên tài liệu / Tiêu đề</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: English Grammar in Use..."
                  className="ecc-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Loại tài nguyên</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="ecc-input"
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Danh mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="ecc-input"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">Đường dẫn URL</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="ecc-input"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    editingResource ? "Cập nhật" : "Tạo mới"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
