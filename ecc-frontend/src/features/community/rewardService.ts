import axiosInstance from '@/lib/axios';
import type { PageResponse } from '@/features/forum/forumService';

export interface RewardItemResponse {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  pointsCost: number;
  type: string;
  stockQuantity?: number;
  isAvailable: boolean;
}

export interface RewardItemRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  pointsCost: number;
  type: string;
  stockQuantity?: number;
  isActive: boolean;
}

export const rewardService = {
  // Member
  getAvailableRewards: async (params?: { page?: number; size?: number }): Promise<PageResponse<RewardItemResponse>> => {
    const res = await axiosInstance.get('/api/community/rewards', { params });
    return res.data.data;
  },

  // Admin
  getAllRewards: async (params?: { page?: number; size?: number }): Promise<PageResponse<RewardItemResponse>> => {
    const res = await axiosInstance.get('/api/community/rewards/admin', { params });
    return res.data.data;
  },

  createReward: async (data: RewardItemRequest): Promise<RewardItemResponse> => {
    const res = await axiosInstance.post('/api/community/rewards/admin', data);
    return res.data.data;
  },

  updateReward: async (id: number, data: RewardItemRequest): Promise<RewardItemResponse> => {
    const res = await axiosInstance.put(`/api/community/rewards/admin/${id}`, data);
    return res.data.data;
  },

  deleteReward: async (id: number): Promise<string> => {
    const res = await axiosInstance.delete(`/api/community/rewards/admin/${id}`);
    return res.data.data;
  },
};