import axiosInstance from '@/lib/axios';
import { SessionResponse } from '../sessions/sessionService';

export interface ModeratorSessionRequest {
  topicId: number;
  title: string;
  description: string;
  coverImage: string;
  maxParticipants: number;
  requiredLevel: string;
  startTime: string;
  endTime: string;
}

export interface SessionSummaryRequest {
  content: string;
}

export interface ModerationWarnRequest {
  userId: number;
  sessionId: number;
  reason: string;
}

export interface ModerationVocabularyRequest {
  sessionId: number;
  userId: number;
  word: string;
  meaning: string;
}

export const moderatorService = {
  createSession: async (data: ModeratorSessionRequest): Promise<SessionResponse> => {
    const res = await axiosInstance.post('/api/moderator/sessions', data);
    return res.data.data;
  },

  submitSummary: async (id: number, data: SessionSummaryRequest): Promise<any> => {
    const res = await axiosInstance.post(`/api/moderator/sessions/${id}/summary`, data);
    return res.data.data;
  },

  warnUser: async (data: ModerationWarnRequest): Promise<any> => {
    const res = await axiosInstance.post('/api/moderation/warn', data);
    return res.data.data;
  },

  addVocabulary: async (data: ModerationVocabularyRequest): Promise<any> => {
    const res = await axiosInstance.post('/api/moderation/vocabulary', data);
    return res.data.data;
  },
};
