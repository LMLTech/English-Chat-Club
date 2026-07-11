import axiosInstance from '@/lib/axios';

export interface UserProfileResponse {
  userId: number;
  email: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  cefrLevel?: string;
  role: string;
  status: string;
  interests?: string[];
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateInterestsRequest {
  topicIds: number[];
}

export interface AddressRequest {
  recipientName: string;
  phoneNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  id: number;
  recipientName: string;
  phoneNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode?: string;
  isDefault: boolean;
}

export const profileService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const res = await axiosInstance.get('/api/profile');
    return res.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    const res = await axiosInstance.put('/api/profile', data);
    return res.data.data;
  },

  updateInterests: async (data: UpdateInterestsRequest): Promise<string> => {
    const res = await axiosInstance.put('/api/profile/interests', data);
    return res.data.data;
  },

  addAddress: async (data: AddressRequest): Promise<AddressResponse> => {
    const res = await axiosInstance.post('/api/profile/addresses', data);
    return res.data.data;
  },

  getAddresses: async (): Promise<AddressResponse[]> => {
    const res = await axiosInstance.get('/api/profile/addresses');
    return res.data.data;
  },

  updateAddress: async (addressId: number, data: AddressRequest): Promise<AddressResponse> => {
    const res = await axiosInstance.put(`/api/profile/addresses/${addressId}`, data);
    return res.data.data;
  },

  deleteAddress: async (addressId: number): Promise<string> => {
    const res = await axiosInstance.delete(`/api/profile/addresses/${addressId}`);
    return res.data.data;
  },

  connectCalendar: async (userId: number, authCode: string): Promise<string> => {
    const res = await axiosInstance.post('/api/profile/calendar/connect', { userId, authCode });
    return res.data.data;
  },

  disconnectCalendar: async (): Promise<string> => {
    const res = await axiosInstance.delete('/api/profile/calendar/disconnect');
    return res.data.data;
  },
};
