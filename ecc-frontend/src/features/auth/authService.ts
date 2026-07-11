import axiosInstance from '@/lib/axios';

// ---- Request Types ----
export interface LoginRequest {
  email?: string;
  password?: string;
  tempToken?: string;
  totpCode?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordOtpRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  accessToken?: string;
  refreshToken: string;
}

export interface Verify2faSetupRequest {
  totpCode: string;
}

export interface Disable2faRequest {
  totpCode: string;
}

// ---- Response Types ----
export interface AuthResponse {
  require2fa: boolean;
  tempToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface Setup2faResponse {
  qrCodeUrl: string;
  secret: string;
}

// ---- Service ----
export const authService = {
  login: async (data: LoginRequest) => {
    const response = await axiosInstance.post('/api/auth/login', data);
    return response.data.data as AuthResponse;
  },

  register: async (data: RegisterRequest) => {
    const response = await axiosInstance.post('/api/auth/register', data);
    return response.data.data as string;
  },

  verifyEmail: async (token: string) => {
    const response = await axiosInstance.get('/api/auth/verify-email', { params: { token } });
    return response.data.data as string;
  },

  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post('/api/auth/forgot-password', { email });
    return response.data.data as string;
  },

  resetPasswordWithOtp: async (data: ResetPasswordOtpRequest) => {
    const response = await axiosInstance.post('/api/auth/reset-password', data);
    return response.data.data as string;
  },

  verify2fa: async (data: LoginRequest) => {
    const response = await axiosInstance.post('/api/auth/2fa/verify-login', data);
    return response.data.data as AuthResponse;
  },

  setup2fa: async (userId: number) => {
    const response = await axiosInstance.post('/api/auth/2fa/setup', null, { params: { userId } });
    return response.data.data as Setup2faResponse;
  },

  enable2fa: async (userId: number, totpCode: string) => {
    const response = await axiosInstance.post('/api/auth/2fa/enable', { totpCode }, { params: { userId } });
    return response.data.data as string;
  },

  disable2fa: async (userId: number, totpCode: string) => {
    const response = await axiosInstance.post('/api/auth/2fa/disable', { totpCode }, { params: { userId } });
    return response.data.data as string;
  },

  refreshToken: async (data: RefreshTokenRequest) => {
    const response = await axiosInstance.post('/api/auth/refresh', data);
    return response.data.data as AuthResponse;
  },

  logout: async (refreshToken: string) => {
    const response = await axiosInstance.post('/api/auth/logout', { refreshToken });
    return response.data.data as string;
  },
};