package com.ecc.community.application.port.out;

import java.time.LocalDate;

public interface UserStatisticsPort {
    // Đếm số buổi học đã tham gia (status = ATTENDED) trong khoảng thời gian
    int countAttendedSessions(Long userId, LocalDate startDate, LocalDate endDate);
    int countTotalAttendedSessions(Long userId);
}