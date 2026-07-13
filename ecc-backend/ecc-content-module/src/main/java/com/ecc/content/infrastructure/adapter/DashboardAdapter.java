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
        String sql = "SELECT COUNT(*) FROM bookings b JOIN sessions s ON b.session_id = s.id " +
                     "WHERE b.member_id = ? AND b.status IN ('CONFIRMED', 'ATTENDED') AND s.status = 'COMPLETED'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null ? count : 0;
    }

    @Override
    public int countUnreadNotifications(Long userId) {
        String sql = "SELECT COUNT(*) FROM in_app_notifications WHERE user_id = ? AND is_read = 0";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null ? count : 0;
    }

    @Override
    public int countUpcomingBookings(Long userId) {
        String sql = "SELECT COUNT(*) FROM bookings b JOIN sessions s ON b.session_id = s.id WHERE b.member_id = ? AND b.status IN ('CONFIRMED', 'PENDING_CONFIRM') AND s.status = 'SCHEDULED'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null ? count : 0;
    }

    @Override
    public int getCurrentStreak(Long userId) {
        String sql = "SELECT current_streak FROM member_points WHERE user_id = ?";
        try {
            Integer streak = jdbcTemplate.queryForObject(sql, Integer.class, userId);
            return streak != null ? streak : 0;
        } catch (EmptyResultDataAccessException e) {
            return 0;
        }
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getUpcomingSessions(Long userId) {
        String sql = "SELECT s.id, s.title, s.start_time as startTime, s.end_time as endTime, s.cover_image as coverImage, s.status, s.required_level as requiredLevel " +
                     "FROM bookings b JOIN sessions s ON b.session_id = s.id " +
                     "WHERE b.member_id = ? AND b.status IN ('CONFIRMED', 'PENDING_CONFIRM') AND s.status = 'SCHEDULED' " +
                     "ORDER BY s.start_time ASC LIMIT 5";
        return jdbcTemplate.queryForList(sql, userId);
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getOngoingSessions(Long userId) {
        String sql = "SELECT s.id, s.title, s.start_time as startTime, s.end_time as endTime, s.cover_image as coverImage, s.status, s.required_level as requiredLevel " +
                     "FROM bookings b JOIN sessions s ON b.session_id = s.id " +
                     "WHERE b.member_id = ? AND b.status IN ('CONFIRMED', 'PENDING_CONFIRM') AND s.status = 'ONGOING' " +
                     "ORDER BY s.start_time ASC LIMIT 5";
        return jdbcTemplate.queryForList(sql, userId);
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getClosedSessions(Long userId) {
        String sql = "SELECT s.id, s.title, s.start_time as startTime, s.end_time as endTime, s.cover_image as coverImage, s.status, s.required_level as requiredLevel " +
                     "FROM bookings b JOIN sessions s ON b.session_id = s.id " +
                     "WHERE b.member_id = ? AND b.status IN ('CONFIRMED', 'ATTENDED', 'PENDING_CONFIRM') AND s.status IN ('COMPLETED', 'CANCELLED') " +
                     "ORDER BY s.start_time DESC LIMIT 5";
        return jdbcTemplate.queryForList(sql, userId);
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