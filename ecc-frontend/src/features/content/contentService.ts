import axiosInstance from '@/lib/axios';
import type { PageResponse } from '@/features/forum/forumService';

// ---- Dashboard ----
export interface MemberDashboardResponse {
  totalSessions: number;
  upcomingBookings: number;
  totalPoints: number;
  currentLevel: number;
  levelTitle: string;
  recentSessions?: any[];
  streakDays?: number;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalSessions: number;
  totalActiveMembers: number;
  pendingApprovals: number;
  totalRevenue?: number;
  recentActivity?: any[];
}

// ---- Learning Resources ----
export interface LearningResourceResponse {
  id: number;
  title: string;
  type: string;
  url: string;
  category: string;
  createdAt: string;
}

export interface LearningResourceRequest {
  title: string;
  type: string;
  url: string;
  category: string;
}

// ---- Notifications ----
export interface NotificationResponse {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const contentService = {
  getMemberDashboard: async (): Promise<MemberDashboardResponse> => {
    const res = await axiosInstance.get('/api/content/dashboard/member');
    return res.data.data;
  },

  getAdminDashboard: async (): Promise<AdminDashboardResponse> => {
    const res = await axiosInstance.get('/api/content/dashboard/admin');
    return res.data.data;
  },

  getResources: async (params?: { category?: string; page?: number; size?: number }): Promise<PageResponse<LearningResourceResponse>> => {
    const res = await axiosInstance.get('/api/content/resources', { params });
    return res.data.data;
  },

  getResourceById: async (id: number): Promise<LearningResourceResponse> => {
    const res = await axiosInstance.get(`/api/content/resources/${id}`);
    return res.data.data;
  },

  createResource: async (data: LearningResourceRequest): Promise<LearningResourceResponse> => {
    const res = await axiosInstance.post('/api/content/resources', data);
    return res.data.data;
  },

  updateResource: async (id: number, data: LearningResourceRequest): Promise<LearningResourceResponse> => {
    const res = await axiosInstance.put(`/api/content/resources/${id}`, data);
    return res.data.data;
  },

  deleteResource: async (id: number): Promise<string> => {
    const res = await axiosInstance.delete(`/api/content/resources/${id}`);
    return res.data.data;
  },

  getNotifications: async (): Promise<NotificationResponse[]> => {
    const res = await axiosInstance.get('/api/content/notifications');
    return res.data.data;
  },
};
