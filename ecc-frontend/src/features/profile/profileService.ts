import axiosInstance from '@/lib/axios';

export interface UserProfileResponse {
  id: number;
  email: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  cefrLevel?: string;
  learningGoal?: string;
  role: string;
  status?: string;
  interests?: string[];
  is2faEnabled: boolean;
  referralCode?: string;
  avatarFrame?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  cefrLevel?: string;
}

export interface UpdateInterestsRequest {
  topicIds: number[];
}

export interface AddressRequest {
  recipientName: string;
  phone: string;
  detail: string;
  district?: string;
  province?: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  id: number;
  recipientName: string;
  phone: string;
  detail: string;
  district?: string;
  province?: string;
  isDefault: boolean;
}

export const profileService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const res = await axiosInstance.get('/api/profile');
    return res.data.data;
  },

  getProfileById: async (id: number): Promise<UserProfileResponse> => {
    const res = await axiosInstance.get(`/api/profile/${id}`);
    return res.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    const res = await axiosInstance.put('/api/profile', data);
    return res.data.data;
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post('/api/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  },

  updateInterests: async (data: UpdateInterestsRequest): Promise<void> => {
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

  searchProfileByEmail: async (email: string): Promise<UserProfileResponse[]> => {
    const res = await axiosInstance.get('/api/profile/search', { params: { email } });
    return res.data.data;
  },

  equipAvatarFrame: async (frameUrl: string): Promise<string> => {
    const res = await axiosInstance.put('/api/profile/avatar-frame', { frameUrl });
    return res.data.data;
  },
};
