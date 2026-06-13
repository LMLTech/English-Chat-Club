package com.ecc.identity.application.port.in;

import com.ecc.identity.api.dto.AuthResponse;
import com.ecc.identity.api.dto.LoginRequest;

// Use Case đăng nhập hệ thống
public interface LoginUseCase {

    // Xử lý đăng nhập và trả về kết quả xác thực
    AuthResponse login(LoginRequest request, String ipAddress);
}