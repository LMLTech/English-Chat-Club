package com.ecc.identity.application.port.out;

// Port làm việc với Redis để lưu token tạm thời
public interface TokenCachePort {

    // Lưu temp token dùng cho xác thực 2FA
    void saveTemp2faToken(String temToken, Long userId, long durationInMinutes);
    Long getUserIdByTemp2faToken(String tempToken); // Thêm hàm đọc token ngược lại
    // Lưu Refresh Token vào Redis

    // Lưu Refresh Token vào Redis (CHỈ GIỮ LẠI HÀM NÀY)
    void saveRefreshToken(Long userId, String tokenId, long durationInMinutes);
    void deleteRefreshToken(Long userId, String tokenId);

    // Quản lý Blacklist
    void addToBlacklist(String jti, long expireSeconds);
    boolean isBlacklisted(String jti);
}