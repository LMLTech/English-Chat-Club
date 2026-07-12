import axiosInstance from '@/lib/axios';

export interface CampaignRequest {
  subject: string;
  targetRole: string;
  htmlContent: string;
}

export interface CampaignResponse {
  id: number;
  subject: string;
  targetRole: string;
  status: string;
  createdAt: string;
}

export const marketingService = {
  createCampaign: async (data: CampaignRequest): Promise<CampaignResponse> => {
    const res = await axiosInstance.post('/api/content/campaigns', data);
    return res.data.data;
  },

  sendCampaignNow: async (id: number): Promise<string> => {
    const res = await axiosInstance.post(`/api/content/campaigns/${id}/send-now`);
    return res.data.data;
  },
  
  getCampaigns: async (): Promise<CampaignResponse[]> => {
    const res = await axiosInstance.get('/api/content/campaigns');
    return res.data.data?.content || res.data.data || [];
  }
};
