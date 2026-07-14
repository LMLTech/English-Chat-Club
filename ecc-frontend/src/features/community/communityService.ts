import axiosInstance from '@/lib/axios';
import type { PageResponse } from '@/features/forum/forumService';

// ---- Gamification ----
export interface MemberPointsResponse {
  userId: number;
  totalPoints: number;
  currentLevel: number;
  levelTitle: string;
  updatedAt: string;
}

export interface PointTransactionResponse {
  id: number;
  points: number;
  reason: string;
  description?: string;
  occurredAt: string;
}

export interface BadgeResponse {
  badgeId: number;
  name: string;
  description?: string;
  iconUrl?: string;
  condition?: string;
  awardedAt: string;
}

// ---- Events ----
export interface EventResponse {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  pointsRequired: number;
  rewardPoints: number;
  status: string;
  startTime: string;
  endTime: string;
  attendancesCount?: number;
}

// ---- Leaderboard ----
export interface LeaderboardEntryResponse {
  rank: number;
  userId: number;
  username?: string;
  avatarUrl?: string;
  score: number;
  levelTitle?: string;
}

// ---- Friends ----
export interface FriendRequestResponse {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  status: string;
  createdAt: string;
}

// ---- Direct Messages ----
export interface DirectMessageResponse {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  content: string;
  recalled: boolean;
  createdAt: string;
}

export const communityService = {
  // Gamification
  getMyPoints: async (): Promise<MemberPointsResponse> => {
    const res = await axiosInstance.get('/api/community/me/points');
    return res.data.data;
  },

  getMyTransactions: async (): Promise<PointTransactionResponse[]> => {
    const res = await axiosInstance.get('/api/community/me/transactions');
    return res.data.data;
  },

  getMyBadges: async (): Promise<BadgeResponse[]> => {
    const res = await axiosInstance.get('/api/community/me/badges');
    return res.data.data;
  },

  // Events
  getPublicEvents: async (): Promise<EventResponse[]> => {
    const res = await axiosInstance.get('/api/events');
    return res.data.data;
  },

  getMyEventRegistrations: async (): Promise<number[]> => {
    const res = await axiosInstance.get('/api/events/my-registrations');
    return res.data.data;
  },

  registerForEvent: async (eventId: number): Promise<any> => {
    const res = await axiosInstance.post(`/api/events/${eventId}/register`);
    return res.data.data;
  },

  // Leaderboard
  getLeaderboard: async (params?: { type?: string; top?: number }): Promise<LeaderboardEntryResponse[]> => {
    const res = await axiosInstance.get('/api/community/leaderboard', { params });
    return res.data.data;
  },

  getMyRank: async (type: string = 'weekly'): Promise<number> => {
    const res = await axiosInstance.get('/api/community/leaderboard/rank', { params: { type } });
    return res.data.data;
  },

  // Friends
  sendFriendRequest: async (receiverId: number): Promise<FriendRequestResponse> => {
    const res = await axiosInstance.post('/api/friends/request', { receiverId });
    return res.data.data;
  },

  acceptFriendRequest: async (requestId: number): Promise<string> => {
    const res = await axiosInstance.put(`/api/friends/request/${requestId}/accept`);
    return res.data.data;
  },

  rejectFriendRequest: async (requestId: number): Promise<string> => {
    const res = await axiosInstance.put(`/api/friends/request/${requestId}/reject`);
    return res.data.data;
  },

  getPendingRequests: async (params?: { page?: number; size?: number }): Promise<PageResponse<FriendRequestResponse>> => {
    const res = await axiosInstance.get('/api/friends/requests/pending', { params });
    return res.data.data;
  },

  getFriends: async (params?: { page?: number; size?: number }): Promise<number[]> => {
    const res = await axiosInstance.get('/api/friends', { params });
    return res.data.data;
  },

  // Direct Messages
  getChatHistory: async (friendId: number, params?: { page?: number; size?: number }): Promise<PageResponse<DirectMessageResponse>> => {
    const res = await axiosInstance.get(`/api/direct-messages/${friendId}`, { params });
    return res.data.data;
  },

  recallMessage: async (messageId: number): Promise<string> => {
    const res = await axiosInstance.put(`/api/direct-messages/${messageId}/recall`);
    return res.data.data;
  },
};
