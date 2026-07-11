import axiosInstance from '@/lib/axios';

export interface RewardItemResponse {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  type: string;
  stockQuantity: number;
  isAvailable: boolean;
}

export interface RewardOrderResponse {
  orderId: string;
  itemName: string;
  pointsDeducted: number;
  status: string;
  trackingCode?: string;
  orderedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface RedeemRequest {
  rewardItemId: number;
  addressId?: number; // Optional if digital
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const rewardService = {
  getRewards: async (page = 0, size = 12): Promise<PaginatedResponse<RewardItemResponse>> => {
    const res = await axiosInstance.get('/api/community/rewards', { params: { page, size } });
    return res.data.data;
  },

  redeemReward: async (data: RedeemRequest): Promise<string> => {
    const res = await axiosInstance.post('/api/community/rewards/redeem', data);
    return res.data.data;
  },

  getMyOrders: async (page = 0, size = 10): Promise<PaginatedResponse<RewardOrderResponse>> => {
    const res = await axiosInstance.get('/api/community/rewards/my-orders', { params: { page, size } });
    return res.data.data;
  },

  updateOrderStatus: async (orderId: string, status: string, trackingCode?: string): Promise<RewardOrderResponse> => {
    const res = await axiosInstance.put(`/api/community/rewards/admin/orders/${orderId}/status`, null, {
      params: { status, trackingCode }
    });
    return res.data.data;
  },
};
