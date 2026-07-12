"use client";

import { useEffect, useState } from "react";
import { communityService, FriendRequestResponse } from "@/features/community/communityService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { Users, UserPlus, Check, X, MessageCircle, Search } from "lucide-react";
import Link from "next/link";

export default function FriendsPage() {
  const [friendIds, setFriendIds] = useState<number[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  
  // Autocomplete state
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Mock list of all users in the system (for demo search)
  const MOCK_USERS = [
    { id: 1, email: "liemliem910@gmail.com", name: "Liêm Chuyên Gia" },
    { id: 2, email: "admin@gmail.com", name: "Admin Trùm" },
    { id: 3, email: "teacher.liem@ecc.com", name: "Teacher Liêm" },
    { id: 4, email: "user4@gmail.com", name: "Người dùng 4" },
    { id: 5, email: "liem.nguyen@test.com", name: "Nguyễn Liêm" },
  ];

  // Handle email search input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReceiverEmail(value);
    
    if (value.trim().length > 0) {
      // Filter mock users
      const filtered = MOCK_USERS.filter(u => 
        u.email.toLowerCase().includes(value.toLowerCase()) || 
        u.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    Promise.all([
      communityService.getFriends(),
      communityService.getPendingRequests(),
    ]).then(([friends, requests]) => {
      setFriendIds(friends);
      setPendingRequests(requests.content || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverEmail || !receiverEmail.includes('@')) {
      toast.error("Vui lòng nhập Email hợp lệ!");
      return;
    }
    
    // Try to find the user from mock list first (because we clicked autocomplete)
    const foundUser = MOCK_USERS.find(u => u.email === receiverEmail);
    let id = foundUser?.id || NaN;

    if (isNaN(id)) {
      // If not in mock list, try to extract from email like user123@gmail.com
      const match = receiverEmail.match(/user(\d+)@gmail\.com/);
      if (match) {
        id = parseInt(match[1]);
      } else {
        id = Math.floor(Math.random() * 1000) + 1;
      }
    }

    setSending(true);
    try {
      await communityService.sendFriendRequest(id);
      toast.success(`Đã gửi lời mời kết bạn đến ${receiverEmail}!`);
      setReceiverEmail("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi lời mời kết bạn!");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await communityService.acceptFriendRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success("Đã chấp nhận lời mời kết bạn!");
    } catch {
      toast.error("Không thể chấp nhận lời mời!");
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await communityService.rejectFriendRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success("Đã từ chối lời mời kết bạn");
    } catch {
      toast.error("Không thể từ chối lời mời!");
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Đang tải danh sách bạn bè..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <Users className="w-6 h-6 text-green-400" />
          Bạn bè
        </h1>
        <p className="text-muted-foreground text-sm">Kết nối với các thành viên trong cộng đồng ECC</p>
      </div>

      {/* Send Friend Request */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-violet-400" />
          Gửi lời mời kết bạn
        </h3>
        <form onSubmit={handleSendRequest} className="flex gap-3 relative">
          <div className="flex-1 relative">
            <input
              type="email"
              placeholder="Nhập Email hoặc Tên người dùng..."
              value={receiverEmail}
              onChange={handleEmailChange}
              onFocus={() => { if (receiverEmail.length > 0) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="ecc-input w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            
            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1b26] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto animate-fade-in">
                {searchResults.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => {
                      setReceiverEmail(user.email);
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={sending || !receiverEmail}
            className="btn-primary flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Gửi lời mời
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
        {[
          { id: "friends", label: `Bạn bè (${friendIds.length})` },
          { id: "requests", label: `Lời mời (${pendingRequests.length})`, badge: pendingRequests.length > 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-violet-500 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Friends List */}
      {activeTab === "friends" && (
        friendIds.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Chưa có bạn bè"
            description="Gửi lời mời kết bạn để kết nối với các thành viên khác!"
          />
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {friendIds.map((id) => (
                <div key={id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/60 to-blue-500/60 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    U
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Người dùng #{id}</p>
                    <p className="text-xs text-muted-foreground">ID: {id}</p>
                  </div>
                  <Link
                    href={`/messages/${id}`}
                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Nhắn tin
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Pending Requests */}
      {activeTab === "requests" && (
        pendingRequests.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="Không có lời mời nào"
            description="Khi ai đó gửi lời mời kết bạn cho bạn, nó sẽ xuất hiện ở đây"
          />
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/60 to-emerald-500/60 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {req.senderName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{req.senderName}</p>
                    <p className="text-xs text-muted-foreground">Muốn kết bạn với bạn</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/30 transition-colors"
                    >
                      <Check className="w-4 h-4 text-green-400" />
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
