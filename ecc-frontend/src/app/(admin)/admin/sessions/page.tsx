"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/adminService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle2, Clock, Activity } from "lucide-react";
import { slideIn, staggerContainer } from "@/lib/utils";

export default function AdminSessionsPage() {
  const [pendingSessions, setPendingSessions] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [approvedSessions, setApprovedSessions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'approved' | 'active'>('pending');

  useEffect(() => {
    Promise.all([
      adminService.getPendingSessions(),
      adminService.getActiveSessions(),
      adminService.getApprovedSessions(),
      adminService.getUsers()
    ])
      .then(([pending, active, approved, usersList]) => {
        setPendingSessions(pending);
        setActiveSessions(active);
        setApprovedSessions(approved);
        setUsers(usersList);
      })
      .catch(() => toast.error("Không thể tải danh sách session"))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try {
      await adminService.approveSession(id);
      toast.success("Đã duyệt Session thành công!");
      setPendingSessions(prev => prev.filter(s => s.id !== id));
      // Refresh approved and active sessions
      const [approved, active] = await Promise.all([
        adminService.getApprovedSessions(),
        adminService.getActiveSessions()
      ]);
      setApprovedSessions(approved);
      setActiveSessions(active);
    } catch (err: any) {
      toast.error("Lỗi khi duyệt session");
    } finally {
      setApprovingId(null);
    }
  };

  const getModeratorDetails = (moderatorId: number) => {
    const user = users.find(u => u.id === moderatorId);
    return {
      name: user?.fullName || 'Moderator',
      email: user?.email || 'N/A',
      avatarUrl: user?.avatarUrl || null
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          Duyệt Session Mới
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Kiểm duyệt các phòng học do Moderator yêu cầu tạo</p>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-2">
        <button 
          onClick={() => setTab('pending')}
          className={`text-sm pb-2 font-medium transition-colors relative ${tab === 'pending' ? 'text-amber-400' : 'text-muted-foreground hover:text-white'}`}
        >
          Chờ duyệt ({pendingSessions.length})
          {tab === 'pending' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-amber-400 rounded-full" />}
        </button>
        <button 
          onClick={() => setTab('approved')}
          className={`text-sm pb-2 font-medium transition-colors relative ${tab === 'approved' ? 'text-blue-400' : 'text-muted-foreground hover:text-white'}`}
        >
          Đã duyệt ({approvedSessions.length})
          {tab === 'approved' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-blue-400 rounded-full" />}
        </button>
        <button 
          onClick={() => setTab('active')}
          className={`text-sm pb-2 font-medium transition-colors relative ${tab === 'active' ? 'text-emerald-400' : 'text-muted-foreground hover:text-white'}`}
        >
          Đang hoạt động ({activeSessions.length})
          {tab === 'active' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />}
        </button>
      </div>

      {tab === 'pending' ? (
        pendingSessions.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 opacity-50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Tất cả đã được xử lý</h2>
            <p className="text-muted-foreground">Không còn session nào đang chờ duyệt lúc này.</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {pendingSessions.map(session => (
                <motion.div 
                  key={session.id} 
                  variants={slideIn} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-3 z-10">
                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg backdrop-blur-md">
                      <Clock className="w-3 h-3" /> Chờ duyệt
                    </span>
                  </div>

                  <div className="absolute top-0 left-0 w-full h-24 overflow-hidden rounded-t-2xl">
                    {session.coverImage ? (
                       <img src={session.coverImage} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                       <div className="w-full h-full bg-gradient-to-br from-amber-900/40 to-black/60" />
                    )}
                  </div>

                  <div className="mt-16 relative z-10">
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1">{session.title}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 overflow-hidden flex-shrink-0">
                         {getModeratorDetails(session.moderatorId).avatarUrl ? (
                            <img src={getModeratorDetails(session.moderatorId).avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-500 font-bold">{getModeratorDetails(session.moderatorId).name.charAt(0)}</div>
                         )}
                      </div>
                      <div>
                        <p className="text-sm text-amber-200/90 font-medium">{getModeratorDetails(session.moderatorId).name}</p>
                        <p className="text-xs text-amber-200/60">{getModeratorDetails(session.moderatorId).email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 mb-6">
                      <p className="text-xs text-muted-foreground">Nội dung: <span className="text-white line-clamp-2" title={session.description}>{session.description || 'Không có mô tả'}</span></p>
                      <p className="text-xs text-muted-foreground">Thời gian: <span className="text-white">{session.startTime ? new Date(session.startTime).toLocaleString('vi-VN') : session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : ''}</span></p>
                      <p className="text-xs text-muted-foreground">Trình độ: <span className="text-white font-bold">{session.requiredLevel || session.cefrLevel}</span></p>
                    </div>

                    <button 
                      onClick={() => handleApprove(session.id)}
                      disabled={approvingId === session.id}
                      className="w-full py-2.5 rounded-lg bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50"
                    >
                      {approvingId === session.id ? "Đang xử lý..." : "Chấp thuận mở phòng"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )
      ) : tab === 'approved' ? (
        approvedSessions.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
            <CheckCircle2 className="w-16 h-16 text-blue-400 opacity-50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Chưa có session nào được duyệt</h2>
            <p className="text-muted-foreground">Các session đã duyệt sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {approvedSessions.map(session => (
                <motion.div 
                  key={session.id} 
                  variants={slideIn} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card rounded-2xl p-5 border border-blue-500/20 bg-blue-500/5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-3 z-10">
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg backdrop-blur-md">
                      <ShieldCheck className="w-3 h-3" /> Đã duyệt
                    </span>
                  </div>

                  <div className="absolute top-0 left-0 w-full h-24 overflow-hidden rounded-t-2xl">
                    {session.coverImage ? (
                       <img src={session.coverImage} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                       <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-black/60" />
                    )}
                  </div>

                  <div className="mt-16 relative z-10">
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1">{session.title}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 overflow-hidden flex-shrink-0">
                         {getModeratorDetails(session.moderatorId).avatarUrl ? (
                            <img src={getModeratorDetails(session.moderatorId).avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-500 font-bold">{getModeratorDetails(session.moderatorId).name.charAt(0)}</div>
                         )}
                      </div>
                      <div>
                        <p className="text-sm text-blue-200/90 font-medium">{getModeratorDetails(session.moderatorId).name}</p>
                        <p className="text-xs text-blue-200/60">{getModeratorDetails(session.moderatorId).email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 mb-6">
                      <p className="text-xs text-muted-foreground">Nội dung: <span className="text-white line-clamp-2" title={session.description}>{session.description || 'Không có mô tả'}</span></p>
                      <p className="text-xs text-muted-foreground">Thời gian: <span className="text-white">{session.startTime ? new Date(session.startTime).toLocaleString('vi-VN') : session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : ''}</span></p>
                      <p className="text-xs text-muted-foreground">Trình độ: <span className="text-white font-bold">{session.requiredLevel || session.cefrLevel}</span></p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )
      ) : (
        activeSessions.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
            <h2 className="text-xl font-bold text-white mb-2">Không có phòng nào đang hoạt động</h2>
            <p className="text-muted-foreground">Hiện tại hệ thống không có phòng nào ở trạng thái IN_PROGRESS hoặc OPEN.</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {activeSessions.map(session => (
                <motion.div 
                  key={session.id} 
                  variants={slideIn} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-3 z-10">
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg backdrop-blur-md">
                      <Activity className="w-3 h-3" /> Đang hoạt động
                    </span>
                  </div>

                  <div className="absolute top-0 left-0 w-full h-24 overflow-hidden rounded-t-2xl">
                    {session.coverImage ? (
                       <img src={session.coverImage} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                       <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-black/60" />
                    )}
                  </div>

                  <div className="mt-16 relative z-10">
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1">{session.title}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 overflow-hidden flex-shrink-0">
                         {getModeratorDetails(session.moderatorId).avatarUrl ? (
                            <img src={getModeratorDetails(session.moderatorId).avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-emerald-500 font-bold">{getModeratorDetails(session.moderatorId).name.charAt(0)}</div>
                         )}
                      </div>
                      <div>
                        <p className="text-sm text-emerald-200/90 font-medium">{getModeratorDetails(session.moderatorId).name}</p>
                        <p className="text-xs text-emerald-200/60">{getModeratorDetails(session.moderatorId).email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 mb-6">
                      <p className="text-xs text-muted-foreground">Nội dung: <span className="text-white line-clamp-2" title={session.description}>{session.description || 'Không có mô tả'}</span></p>
                      <p className="text-xs text-muted-foreground">Bắt đầu: <span className="text-white">{session.startTime ? new Date(session.startTime).toLocaleString('vi-VN') : ''}</span></p>
                      <p className="text-xs text-muted-foreground">Học viên: <span className="text-white font-bold">{session.currentParticipants}/{session.maxParticipants}</span></p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )
      )}
    </div>
  );
}
