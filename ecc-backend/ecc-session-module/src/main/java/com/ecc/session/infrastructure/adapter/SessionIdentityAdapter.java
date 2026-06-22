package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.IdentityPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SessionIdentityAdapter implements IdentityPort {

    // Dùng JdbcTemplate để thao tác trực tiếp với Database
    // Tránh việc phải import các class từ module Identity gây lỗi dependency
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void lockUser(Long userId, String duration, String reason) {
        try {
            // Cập nhật trạng thái BANNED trực tiếp vào bảng users
            jdbcTemplate.update("UPDATE users SET status = 'BANNED' WHERE id = ?", userId);
            log.info("Đã khóa mõm User {} thành công. Lý do: {}", userId, reason);
        } catch (Exception e) {
            log.error("Lỗi khi khóa User {}: {}", userId, e.getMessage());
        }
    }

    @Override
    public boolean isUserBanned(Long userId) {
        try {
            // Đọc trạng thái từ bảng users
            String status = jdbcTemplate.queryForObject(
                    "SELECT status FROM users WHERE id = ?",
                    String.class,
                    userId
            );
            return "BANNED".equals(status);
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra trạng thái User {}: {}", userId, e.getMessage());
            return false; // Nếu không tìm thấy, mặc định cho qua
        }
    }
}