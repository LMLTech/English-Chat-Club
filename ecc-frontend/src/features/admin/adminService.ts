import axiosInstance from '@/lib/axios';

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
  pointsRequired: number;
  rewardPoints: number;
  status: string;
  startTime: string;
  endTime: string;
}

export interface AdminEventRequest {
  title: string;
  description: string;
  pointsRequired: number;
  rewardPoints: number;
  startTime: string;
  endTime: string;
}

export const adminService = {
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
  createEvent: async (data: AdminEventRequest): Promise<AdminEventResponse> => {
    const res = await axiosInstance.post('/api/admin/events', data);
    return res.data.data;
  },

  updateAttendances: async (id: number, attendedUserIds: number[]): Promise<any> => {
    const res = await axiosInstance.put(`/api/admin/events/${id}/attendances`, { attendedUserIds });
    return res.data.data;
  },
};
