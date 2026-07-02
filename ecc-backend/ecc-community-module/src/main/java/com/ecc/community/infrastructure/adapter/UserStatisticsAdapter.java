package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.UserStatisticsPort;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class UserStatisticsAdapter implements UserStatisticsPort {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public int countAttendedSessions(Long userId, LocalDate startDate, LocalDate endDate) {
        // Truy vấn trực tiếp vào bảng bookings của Session Module
        String sql = "SELECT COUNT(*) FROM bookings b " +
                "JOIN sessions s ON b.session_id = s.id " +
                "WHERE b.member_id = ? " +
                "AND b.status = 'ATTENDED' " +
                "AND s.start_time >= ? " +
                "AND s.start_time <= ?";

        // Chuyển LocalDate sang thời gian đầu ngày và cuối ngày
        var start = startDate.atStartOfDay();
        var end = endDate.atTime(23, 59, 59);

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId, start, end);
        return count != null ? count : 0;
    }
}