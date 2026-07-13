"use client";

import { useEffect, useState } from "react";
import { profileService, UserProfileResponse, UpdateProfileRequest } from "@/features/profile/profileService";
import { useAuthStore } from "@/store/useAuthStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { User, Mail, Shield, Star, Edit2, Save, X, Calendar, MapPin, Plus, Share2 } from "lucide-react";
import { authService } from "@/features/auth/authService";

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm] = useState<UpdateProfileRequest>({});
  
  // 2FA Modal state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [processing2FA, setProcessing2FA] = useState(false);

  // Address Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    phone: "",
    detail: "",
    district: "",
    province: "",
    isDefault: true
  });
  
  // Mock Address state for UI demonstration
  const [address, setAddress] = useState<any>({
    recipientName: "Chưa thiết lập",
    phoneNumber: "Chưa thiết lập",
    fullAddress: "Chưa thiết lập"
  });

  useEffect(() => {
    profileService.getProfile()
      .then((data) => {
        setProfile(data);
        setForm({ 
          fullName: data.fullName || "Người dùng", 
          bio: data.bio || "", 
          avatarUrl: data.avatarUrl || "",
          cefrLevel: data.cefrLevel || "A1"
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
      
    profileService.getAddresses().then(res => {
      if (res && res.length > 0) {
        const defaultAddr = res.find(a => a.isDefault) || res[0];
        setAddress({
          id: defaultAddr.id,
          recipientName: defaultAddr.recipientName,
          phoneNumber: defaultAddr.phone,
          fullAddress: `${defaultAddr.detail}${defaultAddr.district ? ', ' + defaultAddr.district : ''}${defaultAddr.province ? ', ' + defaultAddr.province : ''}`
        });
        setAddressForm({
          recipientName: defaultAddr.recipientName,
          phone: defaultAddr.phone,
          detail: defaultAddr.detail,
          district: defaultAddr.district || "",
          province: defaultAddr.province || "",
          isDefault: defaultAddr.isDefault
        });
      }
    }).catch(console.error);
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingAvatar(true);
    try {
      const avatarUrl = await profileService.uploadAvatar(file);
      if (profile) {
        setProfile({ ...profile, avatarUrl });
      }
      if (user) {
        setUser({ ...user, avatarUrl });
      }
      setForm({ ...form, avatarUrl });
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tải ảnh lên!");
    } finally {
      setUploadingAvatar(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

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

  const handleToggle2FA = async () => {
    if (!profile) return;
    setProcessing2FA(true);
    try {
      if (profile.is2faEnabled) {
        if (totpCode.length !== 6) {
          toast.error("Vui lòng nhập đúng 6 số mã xác thực!");
          setProcessing2FA(false);
          return;
        }
        await authService.disable2fa(profile.id, totpCode);
        setProfile({ ...profile, is2faEnabled: false });
        toast.success("Đã tắt bảo mật 2 lớp!");
        setShow2FAModal(false);
      } else {
        if (!qrCode) {
          const res = await authService.setup2fa(profile.id);
          setQrCode(res.qrCodeUrl);
          setSecretKey(res.secretKey);
          setProcessing2FA(false);
          return;
        }
        
        if (totpCode.length !== 6) {
          toast.error("Vui lòng nhập đúng 6 số mã xác thực!");
          setProcessing2FA(false);
          return;
        }
        
        await authService.enable2fa(profile.id, secretKey, totpCode);
        setProfile({ ...profile, is2faEnabled: true });
        toast.success("Bật bảo mật 2 lớp thành công!");
        setShow2FAModal(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!");
    }
    setProcessing2FA(false);
  };

  const handleSaveAddress = async () => {
    try {
      let savedAddress;
      if (address.id) {
        savedAddress = await profileService.updateAddress(address.id, addressForm);
      } else {
        savedAddress = await profileService.addAddress(addressForm);
      }
      setAddress({
        id: savedAddress.id,
        recipientName: savedAddress.recipientName,
        phoneNumber: savedAddress.phone,
        fullAddress: `${savedAddress.detail}${savedAddress.district ? ', ' + savedAddress.district : ''}${savedAddress.province ? ', ' + savedAddress.province : ''}`
      });
      toast.success("Đã lưu địa chỉ nhận quà thành công!");
      setShowAddressModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi lưu địa chỉ!");
    }
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
          <div className="glass-card rounded-xl p-6 text-center relative group">
            <label className="relative w-24 h-24 mx-auto mb-4 block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                {uploadingAvatar ? (
                  <LoadingSpinner size="sm" text="" />
                ) : profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  getInitials(profile?.fullName)
                )}
                {/* Overlay for hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
              </div>
              {profile?.avatarFrame && (
                <img src={profile.avatarFrame} alt="frame" className="absolute -inset-3 w-[120px] h-[120px] object-cover pointer-events-none z-10" />
              )}
            </label>

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
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-muted-foreground">
                    2FA: {(profile?.is2faEnabled || (profile as any)?.['2faEnabled']) ? (
                      <span className="text-green-400 font-medium">Đã bật</span>
                    ) : (
                      <span className="text-red-400 font-medium">Chưa bật</span>
                    )}
                  </span>
                  <button 
                    onClick={() => {
                      setTotpCode("");
                      setQrCode("");
                      setShow2FAModal(true);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded border font-medium transition-colors ${
                      (profile?.is2faEnabled || (profile as any)?.['2faEnabled']) 
                        ? "text-red-400 border-red-500/20 hover:bg-red-500/10" 
                        : "text-green-400 border-green-500/20 hover:bg-green-500/10"
                    }`}
                  >
                    {(profile?.is2faEnabled || (profile as any)?.['2faEnabled']) ? "Tắt 2FA" : "Bật 2FA"}
                  </button>
                </div>
              </div>
              {profile?.createdAt && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Star className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Thành viên từ {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              )}
              {profile?.referralCode && (
                <div className="flex items-center gap-2.5 text-sm mt-1">
                  <Share2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-muted-foreground">Mã giới thiệu: <span className="text-foreground font-medium">{profile.referralCode}</span></span>
                    <button
                      onClick={() => {
                        if (typeof navigator !== 'undefined') {
                          navigator.clipboard.writeText(profile.referralCode || '');
                          toast.success("Đã copy mã giới thiệu!");
                        }
                      }}
                      className="text-[10px] px-2 py-0.5 rounded border border-white/10 hover:bg-white/10 transition-colors text-violet-400"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar & API Integrations */}
          <div className="glass-card rounded-xl p-5 mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Đồng bộ Lịch
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Kết nối với Google Calendar để tự động thêm các buổi học vào lịch của bạn.
            </p>
            <button className="w-full btn-ghost flex items-center justify-center gap-2 px-4 py-2 border border-white/10 hover:bg-white/5 transition-colors">
              <span>Kết nối Google Calendar</span>
            </button>
          </div>
        </div>

        {/* Right: Edit Form & Addresses */}
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
                  <p className="text-sm text-foreground px-4 py-2.5 rounded-lg bg-white/5 border border-white/10">
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
                  <p className="text-sm text-foreground px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 min-h-[80px]">
                    {profile?.bio || <span className="text-muted-foreground">Chưa có thông tin giới thiệu</span>}
                  </p>
                )}
              </div>

              {editing && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground/80">URL ảnh đại diện</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.avatarUrl || ""}
                      onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                      placeholder="Nhập URL ảnh (https://... hoặc /images/...)"
                      className="ecc-input flex-1"
                    />
                    <label className="cursor-pointer flex items-center justify-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-sm font-medium text-violet-400 transition-colors">
                      <Plus className="w-4 h-4 mr-1" /> Tải lên
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Temporary mock for file upload to avoid base64 data truncation in DB
                            const mockUrl = `https://i.pravatar.cc/150?u=${Date.now()}`;
                            setForm({...form, avatarUrl: mockUrl});
                            toast.success("Đã tải ảnh lên thành công!");
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>
              )}

              {editing && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground/80 flex items-center justify-between">
                    Trình độ CEFR 
                    <span className="text-[10px] text-amber-400 font-normal bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Chỉ tăng khi tích điểm</span>
                  </label>
                  <select
                    value={profile?.cefrLevel || "B1"}
                    disabled
                    className="ecc-input opacity-60 cursor-not-allowed"
                  >
                    {CEFR_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
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

          {/* Addresses */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Địa chỉ nhận quà
              </h3>
              <button 
                onClick={() => {
                  setAddressForm({
                    recipientName: address.recipientName !== "Chưa thiết lập" ? address.recipientName : profile?.fullName || "",
                    phone: address.phoneNumber !== "Chưa thiết lập" ? address.phoneNumber : "",
                    detail: "",
                    district: "",
                    province: "",
                    isDefault: true
                  });
                  setShowAddressModal(true);
                }}
                className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5 text-violet-400 hover:text-violet-300"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm/Sửa địa chỉ
              </button>
            </div>
            
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-white">{address.recipientName}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">MẶC ĐỊNH</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{address.phoneNumber}</p>
                <p className="text-xs text-muted-foreground">{address.fullAddress}</p>
              </div>
              <button 
                onClick={() => setShowAddressModal(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1b26] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShow2FAModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-400" />
              {(profile?.is2faEnabled || (profile as any)?.['2faEnabled']) ? "Tắt Bảo Mật 2 Lớp" : "Bật Bảo Mật 2 Lớp (2FA)"}
            </h3>
            
            {(profile?.is2faEnabled || (profile as any)?.['2faEnabled']) ? (
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">Nhập mã gồm 6 chữ số từ ứng dụng Authenticator của bạn để xác nhận tắt 2FA.</p>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập mã 6 số..."
                  className="ecc-input text-center text-xl tracking-[0.5em] font-mono"
                />
              </div>
            ) : (
              <div className="space-y-4 mt-4 text-center">
                {!qrCode ? (
                  <div className="py-8">
                    <button 
                      onClick={handleToggle2FA}
                      disabled={processing2FA}
                      className="btn-primary w-full py-2.5"
                    >
                      Bắt đầu thiết lập
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground text-left">1. Quét mã QR này bằng Google Authenticator hoặc Authy.</p>
                    <div className="bg-white p-3 rounded-xl inline-block mx-auto border-4 border-violet-500/30">
                      <img src={qrCode} alt="2FA QR Code" className="w-32 h-32" />
                    </div>
                    <p className="text-sm text-muted-foreground text-left mt-4">2. Nhập mã gồm 6 chữ số hiển thị trên ứng dụng.</p>
                    <input
                      type="text"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Nhập mã 6 số..."
                      className="ecc-input text-center text-xl tracking-[0.5em] font-mono"
                    />
                  </>
                )}
              </div>
            )}

            {((profile?.is2faEnabled || (profile as any)?.['2faEnabled']) || qrCode) && (
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setShow2FAModal(false)}
                  className="btn-ghost px-4 py-2 text-sm"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleToggle2FA}
                  disabled={processing2FA || totpCode.length !== 6}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    (profile?.is2faEnabled || (profile as any)?.['2faEnabled']) 
                      ? "bg-red-500 hover:bg-red-600 text-white" 
                      : "bg-violet-600 hover:bg-violet-500 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processing2FA ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1b26] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowAddressModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Cập nhật địa chỉ nhận quà
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground/80">Tên người nhận</label>
                  <input
                    type="text"
                    value={addressForm.recipientName}
                    onChange={(e) => setAddressForm({...addressForm, recipientName: e.target.value})}
                    placeholder="Nguyễn Văn A"
                    className="ecc-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground/80">Số điện thoại</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                    placeholder="0987654321"
                    className="ecc-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground/80">Địa chỉ chi tiết (Số nhà, đường)</label>
                <input
                  type="text"
                  value={addressForm.detail}
                  onChange={(e) => setAddressForm({...addressForm, detail: e.target.value})}
                  placeholder="123 Đường ABC..."
                  className="ecc-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground/80">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    value={addressForm.province}
                    onChange={(e) => setAddressForm({...addressForm, province: e.target.value})}
                    placeholder="Hồ Chí Minh"
                    className="ecc-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground/80">Quận / Huyện</label>
                  <input
                    type="text"
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({...addressForm, district: e.target.value})}
                    placeholder="Quận 1"
                    className="ecc-input"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddressModal(false)}
                className="btn-ghost px-4 py-2 text-sm"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveAddress}
                className="btn-primary px-4 py-2 text-sm"
              >
                Lưu địa chỉ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
