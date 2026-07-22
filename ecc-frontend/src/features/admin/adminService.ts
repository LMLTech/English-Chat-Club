import axiosInstance from '@/lib/axios';

export interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  content: string;
  status: string;
  createdAt: string;
  replyMessage?: string;
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
}

export interface EmailCampaign {
  id: number;
  title: string;
  subject: string;
  htmlContent: string;
  targetSegment: string;
  status: string;
  createdAt: string;
}

export interface AdminTopicResponse {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminTopicRequest {
  title: string;
  description: string;
  imageUrl: string;
}

export interface AdminEventResponse {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  pointsRequired: number;
  rewardPoints: number;
  registeredCount?: number;
  startTime: string;
  endTime: string;
}

export interface AdminEventRequest {
  title: string;
  description: string;
  imageUrl?: string;
  pointsRequired: number;
  rewardPoints: number;
  startTime: string;
  endTime: string;
}

export const adminService = {
  // Dashboard
  getDashboardStats: async (): Promise<any> => {
    const res = await axiosInstance.get('/api/admin/dashboard/stats');
    return res.data.data;
  },

  // Users
  getUsers: async (): Promise<any[]> => {
    const res = await axiosInstance.get('/api/admin/users');
    return res.data.data?.content || res.data.data || [];
  },

  updateUserRole: async (userId: number, roleName: string): Promise<string> => {
    const res = await axiosInstance.put(`/api/admin/users/${userId}/role`, null, { params: { roleName } });
    return res.data.data;
  },

  // Sessions
  getPendingSessions: async (): Promise<any[]> => {
    const res = await axiosInstance.get('/api/admin/sessions/pending');
    return res.data.data?.content || res.data.data || [];
  },
  
  getActiveSessions: async (): Promise<any[]> => {
    const res = await axiosInstance.get('/api/admin/sessions/active');
    return res.data.data?.content || res.data.data || [];
  },

  getApprovedSessions: async (): Promise<any[]> => {
    const res = await axiosInstance.get('/api/admin/sessions/approved');
    return res.data.data?.content || res.data.data || [];
  },

  // Topics
  getTopics: async (): Promise<AdminTopicResponse[]> => {
    const res = await axiosInstance.get('/api/admin/topics');
    return res.data.data;
  },

  createTopic: async (data: AdminTopicRequest): Promise<AdminTopicResponse> => {
    const res = await axiosInstance.post('/api/admin/topics', data);
    return res.data.data;
  },

  updateTopic: async (id: number, data: AdminTopicRequest): Promise<AdminTopicResponse> => {
    const res = await axiosInstance.put(`/api/admin/topics/${id}`, data);
    return res.data.data;
  },

  deleteTopic: async (id: number): Promise<string> => {
    const res = await axiosInstance.delete(`/api/admin/topics/${id}`);
    return res.data.data;
  },

  toggleTopicStatus: async (id: number): Promise<string> => {
    const res = await axiosInstance.patch(`/api/admin/topics/${id}/toggle-status`);
    return res.data.data;
  },

  // Sessions
  approveSession: async (id: number): Promise<any> => {
    const res = await axiosInstance.put(`/api/admin/sessions/${id}/approve`);
    return res.data.data;
  },

  // Events
  getEvents: async (): Promise<AdminEventResponse[]> => {
    const res = await axiosInstance.get('/api/admin/events');
    return res.data.data;
  },

  createEvent: async (data: AdminEventRequest): Promise<AdminEventResponse> => {
    const res = await axiosInstance.post('/api/admin/events', data);
    return res.data.data;
  },
  updateEvent: async (id: number, data: AdminEventRequest): Promise<AdminEventResponse> => {
    const res = await axiosInstance.put(`/api/admin/events/${id}`, data);
    return res.data.data;
  },
  deleteEvent: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/admin/events/${id}`);
  },
  markEventAttendances: async (id: number, attendedUserIds: number[]): Promise<void> => {
    const res = await axiosInstance.put(`/api/admin/events/${id}/attendances`, { attendedUserIds });
    return res.data.data;
  },

  // Support Tickets
  getSupportTickets: async (): Promise<SupportTicket[]> => {
    const res = await axiosInstance.get('/api/admin/support-tickets');
    return res.data.data;
  },

  replySupportTicket: async (id: number, replyMessage: string): Promise<SupportTicket> => {
    const res = await axiosInstance.post(`/api/admin/support-tickets/${id}/reply`, { replyMessage });
    return res.data.data;
  },

  // Email Campaigns
  getCampaigns: async (): Promise<EmailCampaign[]> => {
    const res = await axiosInstance.get('/api/content/campaigns');
    return res.data.data;
  },

  createCampaign: async (data: any): Promise<EmailCampaign> => {
    const res = await axiosInstance.post('/api/content/campaigns', data);
    return res.data.data;
  },

  sendCampaignNow: async (id: number): Promise<string> => {
    const res = await axiosInstance.post(`/api/content/campaigns/${id}/send-now`);
    return res.data.data;
  },
};
