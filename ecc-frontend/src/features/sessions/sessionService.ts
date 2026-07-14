import axiosInstance from '@/lib/axios';

export interface DiscussionTopic {
  id: number;
  name: string;
  description?: string;
  status: string;
}

export interface SessionResponse {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  requiredLevel: string;
  status: string;
  topicId?: number;
  topicTitle?: string;
  moderatorId: number;
  moderatorName?: string;
  zoomLink?: string;
}

export interface BookingResponse {
  id: number;
  sessionId: number;
  memberId: number;
  status: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  moderatorRating: number;
  topicRating: number;
  comment?: string;
}

export interface SessionRequest {
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  maxParticipants: number;
  cefrLevel: string;
  topicId?: number;
  zoomLink?: string;
}

export interface SessionSummaryRequest {
  summary: string;
  vocabularyHighlights?: string[];
}

export const sessionService = {
  getTopics: async (): Promise<DiscussionTopic[]> => {
    const res = await axiosInstance.get('/api/topics');
    return res.data.data;
  },

  getSessions: async (params?: any): Promise<any> => {
    const res = await axiosInstance.get('/api/sessions', { params });
    return res.data.data;
  },

  getMyBookedSessionIds: async (): Promise<number[]> => {
    const res = await axiosInstance.get('/api/sessions/my-bookings');
    return res.data.data;
  },

  getSessionById: async (sessionId: number): Promise<SessionResponse> => {
    const res = await axiosInstance.get(`/api/sessions/${sessionId}`);
    return res.data.data;
  },

  getChatHistory: async (sessionId: number): Promise<any[]> => {
    const res = await axiosInstance.get(`/api/sessions/${sessionId}/messages`);
    return res.data.data;
  },

  getVocabularies: async (sessionId: number): Promise<any[]> => {
    const res = await axiosInstance.get(`/api/sessions/${sessionId}/vocabularies`);
    return res.data.data;
  },

  bookSession: async (sessionId: number): Promise<BookingResponse> => {
    const res = await axiosInstance.post(`/api/sessions/${sessionId}/book`);
    return res.data.data;
  },

  cancelBooking: async (sessionId: number): Promise<BookingResponse> => {
    const res = await axiosInstance.delete(`/api/sessions/${sessionId}/book`);
    return res.data.data;
  },

  confirmPromotion: async (sessionId: number): Promise<BookingResponse> => {
    const res = await axiosInstance.post(`/api/sessions/${sessionId}/confirm-promote`);
    return res.data.data;
  },

  submitReview: async (sessionId: number, data: CreateReviewRequest): Promise<void> => {
    await axiosInstance.post(`/api/sessions/${sessionId}/review`, data);
  },

  // Moderator
  createSession: async (data: SessionRequest): Promise<SessionResponse> => {
    const res = await axiosInstance.post('/api/moderator/sessions', data);
    return res.data.data;
  },

  createSessionSummary: async (sessionId: number, data: SessionSummaryRequest): Promise<void> => {
    await axiosInstance.post(`/api/moderator/sessions/${sessionId}/summary`, data);
  },

  // Admin
  approveSession: async (sessionId: number): Promise<SessionResponse> => {
    const res = await axiosInstance.put(`/api/admin/sessions/${sessionId}/approve`);
    return res.data.data;
  },

  // Events
  registerForEvent: async (eventId: number): Promise<void> => {
    await axiosInstance.post(`/api/events/${eventId}/register`);
  },

  // Voice Record
  saveVoiceRecord: async (sessionId: number, duration: number, audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'record.webm');
    formData.append('sessionId', sessionId.toString());
    formData.append('duration', duration.toString());

    const res = await axiosInstance.post('/api/voice/record', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  },
};
