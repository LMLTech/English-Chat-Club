package com.ecc.identity.application.port.out;

// Port làm việc với Redis để lưu token tạm thời
public interface TokenCachePort {

    // Lưu temp token dùng cho xác thực 2FA
    void saveTemp2faToken(Long userId, String token, long durationInMinutes);

    // Lưu Refresh Token vào Redis
    void saveRefreshToken(Long userId, String tokenId, long durationInMinutes);
}