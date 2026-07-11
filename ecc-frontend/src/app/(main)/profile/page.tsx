"use client";

import { useEffect, useState } from "react";
import { profileService, UserProfileResponse, UpdateProfileRequest } from "@/features/profile/profileService";
import { useAuthStore } from "@/store/useAuthStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { User, Mail, Shield, Star, Edit2, Save, X } from "lucide-react";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const getRoleBadge = (role: string) => {
  const styles: Record<string, string> = {
    ADMIN: "bg-red-500/20 border-red-500/30 text-red-400",
    MODERATOR: "bg-amber-500/20 border-amber-500/30 text-amber-400",
    MEMBER: "bg-violet-500/20 border-violet-500/30 text-violet-400",
  };
  return styles[role] || styles.MEMBER;
};

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UpdateProfileRequest>({});

  useEffect(() => {
    profileService.getProfile()
      .then((data) => {
        setProfile(data);
        setForm({ fullName: data.fullName, bio: data.bio, avatarUrl: data.avatarUrl });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(form);
      setProfile(updated);
      if (user) {
        setUser({ ...user, fullName: updated.fullName, avatarUrl: updated.avatarUrl });
      }
      setEditing(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  if (loading) return <LoadingSpinner size="lg" text="Đang tải hồ sơ..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <User className="w-6 h-6 text-violet-400" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-muted-foreground text-sm">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar & basic info */}
        <div className="space-y-4">
          {/* Avatar Card */}
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white animate-pulse-glow">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  getInitials(profile?.fullName)
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white mb-1">{profile?.fullName}</h2>
            <p className="text-sm text-muted-foreground mb-3">{profile?.email}</p>

            <div className="flex gap-2 justify-center flex-wrap">
              {profile?.role && (
                <span className={`badge-pill border text-xs ${getRoleBadge(profile.role)}`}>
                  {profile.role}
                </span>
              )}
              {profile?.cefrLevel && (
                <span className="badge-pill border text-xs text-blue-400 bg-blue-500/10 border-blue-500/20">
                  {profile.cefrLevel}
                </span>
              )}
              <span className={`badge-pill border text-xs ${
                profile?.status === "ACTIVE"
                  ? "text-green-400 bg-green-500/10 border-green-500/20"
                  : "text-gray-400 bg-gray-500/10 border-gray-500/20"
              }`}>
                {profile?.status === "ACTIVE" ? "Hoạt động" : profile?.status}
              </span>
            </div>
          </div>

          {/* Account Info */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Thông tin tài khoản</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">
                  2FA: {profile?.twoFactorEnabled ? (
                    <span className="text-green-400">Đã bật</span>
                  ) : (
                    <span className="text-red-400">Chưa bật</span>
                  )}
                </span>
              </div>
              {profile?.createdAt && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Star className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Thành viên từ {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-foreground">Thông tin cá nhân</h3>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(false); setForm({ fullName: profile?.fullName, bio: profile?.bio }); }}
                    className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
                  >
                    {saving ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Lưu
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground/80">Họ và tên</label>
                {editing ? (
                  <input
                    type="text"
                    value={form.fullName || ""}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="ecc-input"
                  />
                ) : (
                  <p className="text-sm text-foreground px-4 py-2.5 rounded-lg bg-white/3 border border-white/5">
                    {profile?.fullName || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground/80">Giới thiệu bản thân</label>
                {editing ? (
                  <textarea
                    value={form.bio || ""}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={4}
                    placeholder="Viết vài dòng về bản thân bạn..."
                    className="ecc-input resize-none"
                  />
                ) : (
                  <p className="text-sm text-foreground px-4 py-2.5 rounded-lg bg-white/3 border border-white/5 min-h-[80px]">
                    {profile?.bio || <span className="text-muted-foreground">Chưa có thông tin giới thiệu</span>}
                  </p>
                )}
              </div>

              {editing && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground/80">URL ảnh đại diện</label>
                  <input
                    type="url"
                    value={form.avatarUrl || ""}
                    onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="ecc-input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Interests */}
          {profile?.interests && profile.interests.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Chủ đề quan tâm</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, i) => (
                  <span key={i} className="badge-pill text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
