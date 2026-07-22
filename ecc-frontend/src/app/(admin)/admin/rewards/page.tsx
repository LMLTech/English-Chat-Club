"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Package, Gift, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { rewardService, RewardItemResponse, RewardItemRequest } from "@/features/community/rewardService";

export default function AdminRewardsPage() {
  const [items, setItems] = useState<RewardItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RewardItemResponse | null>(null);
  const [formData, setFormData] = useState<RewardItemRequest>({
    name: "",
    description: "",
    imageUrl: "",
    pointsCost: 0,
    type: "VIRTUAL",
    stockQuantity: 0,
    isActive: true
  });
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    try {
      const res = await rewardService.getAllRewards({ page: 0, size: 50 });
      setItems(res.content || []);
    } catch (error) {
      toast.error("Không thể tải danh sách phần thưởng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await rewardService.updateReward(editingItem.id, formData);
        toast.success("Cập nhật phần thưởng thành công");
      } else {
        await rewardService.createReward(formData);
        toast.success("Tạo phần thưởng thành công");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa phần thưởng này?")) return;
    try {
      await rewardService.deleteReward(id);
      toast.success("Đã xóa phần thưởng");
      fetchItems();
    } catch (error) {
      toast.error("Không thể xóa");
    }
  };

  const openModal = (item?: RewardItemResponse) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || "",
        imageUrl: item.imageUrl || "",
        pointsCost: item.pointsCost,
        type: item.type,
        stockQuantity: item.stockQuantity || 0,
        isActive: item.isAvailable
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        pointsCost: 0,
        type: "VIRTUAL",
        stockQuantity: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  if (loading) return <LoadingSpinner size="lg" text="Đang tải..." />;

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-500" /> Quản lý cửa hàng quà tặng
          </h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý hàng hóa vật lý và hàng ảo</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm quà tặng
        </button>
      </div>

      <div className="glass-panel p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm phần thưởng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full"
        />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/40 text-slate-300">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Ảnh</th>
                <th className="px-6 py-4">Tên phần thưởng</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Giá điểm</th>
                <th className="px-6 py-4">Tồn kho</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.type === 'VIRTUAL' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {item.type === 'VIRTUAL' ? 'Hàng Ảo' : 'Vật Lý'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-amber-400 font-bold">{item.pointsCost}</td>
                  <td className="px-6 py-4">{item.stockQuantity ?? '∞'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(item)} className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingItem ? "Sửa phần thưởng" : "Thêm phần thưởng"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tên quà tặng *</label>
                <input required type="text" className="ecc-input w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Mô tả chi tiết</label>
                <textarea className="ecc-input w-full min-h-[80px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Hình ảnh đại diện (URL)</label>
                <input type="text" className="ecc-input w-full" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Giá điểm *</label>
                  <input required type="number" min="0" className="ecc-input w-full" value={formData.pointsCost} onChange={e => setFormData({...formData, pointsCost: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Loại hàng *</label>
                  <select className="ecc-input w-full" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="VIRTUAL">Hàng Ảo (Virtual)</option>
                    <option value="PHYSICAL">Vật Lý (Physical)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tồn kho</label>
                  <input type="number" min="0" className="ecc-input w-full" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})} />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500/50" />
                    <span className="text-sm font-medium text-slate-300">Hoạt động</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}