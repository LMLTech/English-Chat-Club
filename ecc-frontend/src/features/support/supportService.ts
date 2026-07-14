import axiosInstance from '@/lib/axios';

export interface SupportTicketResponse {
  id: number;
  uuid: string;
  subject: string;
  content: string;
  replyMessage: string | null;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CreateTicketRequest {
  subject: string;
  category: string;
  content: string;
}

export interface TicketReplyRequest {
  replyMessage: string;
}

export const supportService = {
  // User APIs
  getTickets: async (): Promise<SupportTicketResponse[]> => {
    const res = await axiosInstance.get('/api/users/support-tickets');
    return res.data.data;
  },

  createTicket: async (data: CreateTicketRequest): Promise<SupportTicketResponse> => {
    const res = await axiosInstance.post('/api/users/support-tickets', data);
    return res.data.data;
  },

  // Admin APIs
  getAllTickets: async (): Promise<SupportTicketResponse[]> => {
    const res = await axiosInstance.get('/api/admin/support-tickets');
    return res.data.data;
  },

  replyTicket: async (id: number, data: TicketReplyRequest): Promise<SupportTicketResponse> => {
    const res = await axiosInstance.post(`/api/admin/support-tickets/${id}/reply`, data);
    return res.data.data;
  },
};
