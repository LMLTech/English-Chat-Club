import axiosInstance from '@/lib/axios';

export interface NotificationResponse {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  referenceId: number;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (unreadOnly: boolean = false): Promise<NotificationResponse[]> => {
    const res = await axiosInstance.get('/api/content/notifications', { params: { unreadOnly } });
    return res.data.data?.content || res.data.data || [];
  },

  markAsRead: async (id: number): Promise<void> => {
    await axiosInstance.put(`/api/content/notifications/${id}/read`);
  },
  
  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.put('/api/content/notifications/read-all');
  }
};
