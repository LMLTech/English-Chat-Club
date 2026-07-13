"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { profileService } from "@/features/profile/profileService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  User, Mail, Shield, Camera, Edit3,
  Save, X, Globe, BookOpen, Calendar, Award
} from "lucide-react";

export default function ModeratorProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    cefrLevel: "",
    learningGoal: "",
  });

  useEffect(() => {
    profileService.getProfile()
      .then((data: any) => {
        setProfile(data);
        setFormData({
          fullName: data.fullName || "",
          bio: data.bio || "",
          cefrLevel: data.cefrLevel || "",
          learningGoal: data.learningGoal || "",
        });
      })
      .catch(() => toast.error("Không thể tải hồ sơ"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await profileService.updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setEditing(false);
      toast.success("Đã cập nhật hồ sơ thành công!");
    } catch (err) {
      toast.error("Lỗi khi cập nhật hồ sơ");
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Đang tải hồ sơ..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">Hồ sơ cá nhân</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {/* Avatar & Name Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />

        <div className="relative flex items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center border-2 border-amber-500/30 overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-amber-400">
                  {profile?.fullName?.[0] || "M"}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg">
              <Shield className="w-4 h-4 text-black" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{profile?.fullName || user?.fullName}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" />
              {profile?.email || user?.email}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                MODERATOR
              </span>
              {profile?.cefrLevel && (
                <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold border border-violet-500/20">
                  {profile.cefrLevel}
                </span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setEditing(!editing)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              editing
                ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
            )}
          >
            {editing ? <><X className="w-4 h-4" /> Hủy</> : <><Edit3 className="w-4 h-4" /> Chỉnh sửa</>}
          </button>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 border border-white/5 space-y-5"
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          Thông tin chi tiết
        </h3>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
            {editing ? (
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="ecc-input"
              />
            ) : (
              <p className="text-white bg-white/5 px-4 py-2.5 rounded-lg border border-white/5">{profile?.fullName || "—"}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Giới thiệu bản thân</label>
            {editing ? (
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="ecc-input resize-none"
                placeholder="Chia sẻ đôi chút về bạn..."
              />
            ) : (
              <p className="text-white bg-white/5 px-4 py-2.5 rounded-lg border border-white/5 min-h-[60px]">{profile?.bio || "Chưa có giới thiệu"}</p>
            )}
          </div>

          {/* CEFR Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Trình độ CEFR</label>
              {editing ? (
                <select
                  value={formData.cefrLevel}
                  onChange={e => setFormData({ ...formData, cefrLevel: e.target.value })}
                  className="ecc-input"
                >
                  <option value="">Chọn trình độ</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              ) : (
                <p className="text-white bg-white/5 px-4 py-2.5 rounded-lg border border-white/5">{profile?.cefrLevel || "—"}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Mục tiêu học tập</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.learningGoal}
                  onChange={e => setFormData({ ...formData, learningGoal: e.target.value })}
                  className="ecc-input"
                  placeholder="IELTS 7.0, giao tiếp..."
                />
              ) : (
                <p className="text-white bg-white/5 px-4 py-2.5 rounded-lg border border-white/5">{profile?.learningGoal || "—"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {editing && (
          <motion.button
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSave}
            className="w-full py-3 rounded-xl font-semibold text-black bg-amber-500 hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </motion.button>
        )}
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 border border-white/5 space-y-4"
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          Thông tin tài khoản
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 px-4 py-3 rounded-lg border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Vai trò</p>
            <p className="text-sm font-semibold text-amber-400">Moderator</p>
          </div>
          <div className="bg-white/5 px-4 py-3 rounded-lg border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Bảo mật 2FA</p>
            <p className="text-sm font-semibold text-white">{profile?.is2faEnabled ? "Đã bật" : "Chưa bật"}</p>
          </div>
          <div className="bg-white/5 px-4 py-3 rounded-lg border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Mã giới thiệu</p>
            <p className="text-sm font-semibold text-white font-mono">{profile?.referralCode || "—"}</p>
          </div>
          <div className="bg-white/5 px-4 py-3 rounded-lg border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Ngày tham gia</p>
            <p className="text-sm font-semibold text-white">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : "—"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
