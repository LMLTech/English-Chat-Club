import axiosInstance from '@/lib/axios';

export interface ForumPostResponse {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  categoryId?: number;
  categoryName?: string;
  status: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumCommentResponse {
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  content: string;
  parentId?: number;
  likeCount: number;
  createdAt: string;
}

export interface ForumCategoryResponse {
  id: number;
  name: string;
  description?: string;
  postCount: number;
}

export interface ForumPostRequest {
  title: string;
  content: string;
  categoryId?: number;
  requireApproval?: boolean;
}

export interface ForumCommentRequest {
  content: string;
  parentId?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const forumService = {
  getPosts: async (params?: { categoryId?: number; page?: number; size?: number }): Promise<PageResponse<ForumPostResponse>> => {
    const res = await axiosInstance.get('/api/forum/posts', { params });
    return res.data.data;
  },

  getPost: async (id: number): Promise<ForumPostResponse> => {
    const res = await axiosInstance.get(`/api/forum/posts/${id}`);
    return res.data.data;
  },

  createPost: async (data: ForumPostRequest): Promise<ForumPostResponse> => {
    const res = await axiosInstance.post('/api/forum/posts', data);
    return res.data.data;
  },

  updatePost: async (id: number, data: ForumPostRequest): Promise<ForumPostResponse> => {
    const res = await axiosInstance.put(`/api/forum/posts/${id}`, data);
    return res.data.data;
  },

  deletePost: async (id: number): Promise<string> => {
    const res = await axiosInstance.delete(`/api/forum/posts/${id}`);
    return res.data.data;
  },

  toggleLike: async (postId: number): Promise<string> => {
    const res = await axiosInstance.post(`/api/forum/posts/${postId}/like`);
    return res.data.data;
  },

  toggleSave: async (postId: number): Promise<string> => {
    const res = await axiosInstance.post(`/api/forum/posts/${postId}/save`);
    return res.data.data;
  },

  getSavedPosts: async (params?: { page?: number; size?: number }): Promise<PageResponse<ForumPostResponse>> => {
    const res = await axiosInstance.get('/api/forum/posts/saved', { params });
    return res.data.data;
  },

  getComments: async (postId: number, params?: { page?: number; size?: number }): Promise<PageResponse<ForumCommentResponse>> => {
    const res = await axiosInstance.get(`/api/forum/posts/${postId}/comments`, { params });
    return res.data.data;
  },

  addComment: async (postId: number, data: ForumCommentRequest): Promise<ForumCommentResponse> => {
    const res = await axiosInstance.post(`/api/forum/posts/${postId}/comments`, data);
    return res.data.data;
  },

  deleteComment: async (commentId: number): Promise<string> => {
    const res = await axiosInstance.delete(`/api/forum/comments/${commentId}`);
    return res.data.data;
  },

  getCategories: async (): Promise<ForumCategoryResponse[]> => {
    const res = await axiosInstance.get('/api/forum/categories');
    return res.data.data;
  },
};
