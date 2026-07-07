package com.ecc.content.infrastructure.adapter;

import com.ecc.content.application.port.out.DashboardPort;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DashboardAdapter implements DashboardPort {

    private final JdbcTemplate jdbcTemplate;

    // ==========================================
    // MEMBER METRICS
    // ==========================================
    @Override
    public int getTotalPoints(Long userId) {
        String sql = "SELECT total_points FROM member_points WHERE user_id = ?";
        try {
            Integer points = jdbcTemplate.queryForObject(sql, Integer.class, userId);
            return points != null ? points : 0;
        } catch (EmptyResultDataAccessException e) {
            return 0; // Chưa có hồ sơ điểm
        }
    }

    @Override
    public int getCurrentLevel(Long userId) {
        String sql = "SELECT current_level FROM member_points WHERE user_id = ?";
        try {
            Integer level = jdbcTemplate.queryForObject(sql, Integer.class, userId);
            return level != null ? level : 1;
        } catch (EmptyResultDataAccessException e) {
            return 1;
        }
    }

    @Override
    public int countAttendedSessions(Long userId) {
        String sql = "SELECT COUNT(*) FROM bookings WHERE member_id = ? AND status = 'ATTENDED'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null ? count : 0;
    }

    @Override
    public int countUnreadNotifications(Long userId) {
        String sql = "SELECT COUNT(*) FROM in_app_notifications WHERE user_id = ? AND is_read = 0";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null ? count : 0;
    }

    // ==========================================
    // ADMIN METRICS
    // ==========================================
    @Override
    public int countTotalUsers() {
        String sql = "SELECT COUNT(*) FROM users";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return count != null ? count : 0;
    }

    @Override
    public int countNewUsersThisMonth() {
        String sql = "SELECT COUNT(*) FROM users WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return count != null ? count : 0;
    }

    @Override
    public int countActiveSessions() {
        String sql = "SELECT COUNT(*) FROM sessions WHERE status IN ('SCHEDULED', 'ONGOING')";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return count != null ? count : 0;
    }

    @Override
    public int countTotalCampaignsSent() {
        String sql = "SELECT COUNT(*) FROM email_campaigns WHERE status = 'SENT'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return count != null ? count : 0;
    }
}