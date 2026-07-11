import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR 1: Tự động gắn Access Token trước khi request bay đi
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR 2: Tự động xử lý khi Token hết hạn (Lỗi 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu Backend trả về 401 và request này chưa từng được retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { accessToken, refreshToken } = useAuthStore.getState();
        
        // Gọi API Refresh của Backend (Flow 1.5)
        const response = await axios.post(`${axiosInstance.defaults.baseURL}/api/auth/refresh`, {
          accessToken,
          refreshToken
        });

        const newTokens = response.data.data; // Rút data từ ApiResponse
        
        // Lưu token mới vào Zustand
        useAuthStore.getState().setTokens(newTokens.accessToken, newTokens.refreshToken);

        // Gắn token mới vào request bị lỗi lúc nãy và GỬI LẠI
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // Nếu Refresh Token cũng hết hạn -> Đá văng ra màn hình Đăng nhập
        useAuthStore.getState().clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;