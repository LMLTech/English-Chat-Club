package com.ecc.identity.application.port.out;

import java.time.LocalDateTime;

// Port thao tác với dữ liệu đăng nhập thất bại
public interface LoginAttemptRepositoryPort {

    // Đếm số lần đăng nhập thất bại kể từ thời điểm chỉ định
    int countRecentFailedAttempts(String email, LocalDateTime since);

    // Lưu một lần đăng nhập thất bại
    void recordFailedAttempt(String email, String ipAddress);

    // Xóa toàn bộ lịch sử đăng nhập thất bại của email
    void clearAttempts(String email);
}