package com.ecc.session.application.port.out;

public interface IdentityPort {
    /**
     * Khóa tài khoản user
     * @param userId ID của user
     * @param duration Thời gian khóa (ví dụ: "24h")
     * @param reason Lý do khóa
     */
    void lockUser(Long userId, String duration, String reason);
}
