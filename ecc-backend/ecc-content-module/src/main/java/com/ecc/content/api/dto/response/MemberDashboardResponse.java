package com.ecc.content.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberDashboardResponse {
    private int totalPoints;
    private int currentLevel;
    private int totalSessionsAttended;
    private int unreadNotifications;
    private int upcomingBookings;
    private int currentStreak;

    private java.util.List<java.util.Map<String, Object>> upcomingSessions;
    private java.util.List<java.util.Map<String, Object>> ongoingSessions;
    private java.util.List<java.util.Map<String, Object>> closedSessions;
}