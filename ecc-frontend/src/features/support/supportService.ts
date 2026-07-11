import axiosInstance from '@/lib/axios';

export interface SupportTicketResponse {
  id: number;
  uuid: string;
  subject: string;
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
  priority: string;
  message: string;
}

export interface TicketMessageRequest {
  message: string;
}

export const supportService = {
  getTickets: async (status?: string): Promise<SupportTicketResponse[]> => {
    const res = await axiosInstance.get('/api/support/tickets', { params: { status } });
    return res.data.data;
  },

  createTicket: async (data: CreateTicketRequest): Promise<string> => {
    const res = await axiosInstance.post('/api/support/tickets', data);
    return res.data.data;
  },

  closeTicket: async (uuid: string): Promise<string> => {
    const res = await axiosInstance.put(`/api/support/tickets/${uuid}/close`);
    return res.data.data;
  },

  addMessage: async (uuid: string, data: TicketMessageRequest): Promise<string> => {
    const res = await axiosInstance.post(`/api/support/tickets/${uuid}/messages`, data);
    return res.data.data;
  },
};
