package com.ecc.content.infrastructure.adapter;

import com.ecc.content.application.port.out.DashboardPort;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
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
        } catch (Exception e) {
            log.warn("Lỗi khi lấy totalPoints cho userId {}: {}", userId, e.getMessage());
            return 0; // Chưa có hồ sơ điểm hoặc lỗi DB
        }
    }

    @Override
    public int getCurrentLevel(Long userId) {
        String sql = "SELECT current_level FROM member_points WHERE user_id = ?";
        try {
            Integer level = jdbcTemplate.queryForObject(sql, Integer.class, userId);
            return level != null ? level : 1;
        } catch (Exception e) {
            log.warn("Lỗi khi lấy currentLevel cho userId {}: {}", userId, e.getMessage());
            return 1;
        }
    }

    @Override
    public int countAttendedSessions(Long userId) {
        String sql = "SELECT COUNT(*) FROM bookings b JOIN sessions s ON b.session_id = s.id " +
                     "WHERE b.member_id = ? AND (b.status IN ('CONFIRMED', 'ATTENDED') AND (s.status = 'COMPLETED' OR (s.status != 'CANCELLED' AND s.end_time < NOW())))";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.warn("Lỗi khi đếm attendedSessions cho userId {}: {}", userId, e.getMessage());
            return 0;
        }
    }

    @Override
    public int countUnreadNotifications(Long userId) {
        String sql = "SELECT COUNT(*) FROM in_app_notifications WHERE user_id = ? AND is_read = 0";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.warn("Lỗi khi đếm unreadNotifications cho userId {}: {}", userId, e.getMessage());
            return 0;
        }
    }

    @Override
    public int countUpcomingBookings(Long userId) {
        String sql = "SELECT COUNT(*) FROM bookings b JOIN sessions s ON b.session_id = s.id WHERE b.member_id = ? AND b.status IN ('CONFIRMED', 'PENDING_CONFIRM') AND s.status != 'CANCELLED' AND s.start_time > NOW()";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.warn("Lỗi khi đếm upcomingBookings cho userId {}: {}", userId, e.getMessage());
            return 0;
        }
    }

    @Override
    public int getCurrentStreak(Long userId) {
        String sql = "SELECT current_streak FROM member_points WHERE user_id = ?";
        try {
            Integer streak = jdbcTemplate.queryForObject(sql, Integer.class, userId);
            return streak != null ? streak : 0;
        } catch (Exception e) {
            log.warn("Lỗi khi lấy currentStreak cho userId {}: {}", userId, e.getMessage());
            return 0;
        }
    }

    @Override
    public List<Map<String, Object>> getUpcomingSessions(Long userId) {
        String sql = "SELECT s.id, s.title, s.start_time as startTime, s.end_time as endTime, s.cover_image as coverImage, s.status, s.required_level as requiredLevel " +
                     "FROM bookings b JOIN sessions s ON b.session_id = s.id " +
                     "WHERE b.member_id = ? AND b.status IN ('CONFIRMED', 'PENDING_CONFIRM') AND s.status != 'CANCELLED' AND s.start_time > NOW() " +
                     "ORDER BY s.start_time ASC LIMIT 5";
        try {
            return jdbcTemplate.queryForList(sql, userId);
        } catch (Exception e) {
            log.warn("Lỗi khi lấy upcomingSessions cho userId {}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<Map<String, Object>> getOngoingSessions(Long userId) {
        String sql = "SELECT s.id, s.title, s.start_time as startTime, s.end_time as endTime, s.cover_image as coverImage, s.status, s.required_level as requiredLevel " +
                     "FROM bookings b JOIN sessions s ON b.session_id = s.id " +
                     "WHERE b.member_id = ? AND b.status IN ('CONFIRMED', 'PENDING_CONFIRM') AND s.status != 'CANCELLED' AND s.start_time <= NOW() AND s.end_time >= NOW() " +
                     "ORDER BY s.start_time ASC LIMIT 5";
        try {
            return jdbcTemplate.queryForList(sql, userId);
        } catch (Exception e) {
            log.warn("Lỗi khi lấy ongoingSessions cho userId {}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<Map<String, Object>> getClosedSessions(Long userId) {
        String sql = "SELECT s.id, s.title, s.start_time as startTime, s.end_time as endTime, s.cover_image as coverImage, s.status, s.required_level as requiredLevel " +
                     "FROM bookings b JOIN sessions s ON b.session_id = s.id " +
                     "WHERE b.member_id = ? AND (b.status IN ('CONFIRMED', 'ATTENDED', 'PENDING_CONFIRM') AND (s.status IN ('COMPLETED', 'CANCELLED') OR (s.status != 'CANCELLED' AND s.end_time < NOW()))) " +
                     "ORDER BY s.start_time DESC LIMIT 5";
        try {
            return jdbcTemplate.queryForList(sql, userId);
        } catch (Exception e) {
            log.warn("Lỗi khi lấy closedSessions cho userId {}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    // ==========================================
    // ADMIN METRICS
    // ==========================================
    @Override
    public int countTotalUsers() {
        String sql = "SELECT COUNT(*) FROM users";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public int countNewUsersThisMonth() {
        String sql = "SELECT COUNT(*) FROM users WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public int countActiveSessions() {
        String sql = "SELECT COUNT(*) FROM sessions WHERE status IN ('SCHEDULED', 'ONGOING')";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public int countTotalCampaignsSent() {
        String sql = "SELECT COUNT(*) FROM email_campaigns WHERE status = 'SENT'";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            return 0;
        }
    }
}