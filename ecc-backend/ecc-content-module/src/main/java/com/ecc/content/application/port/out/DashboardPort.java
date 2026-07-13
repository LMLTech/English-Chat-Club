package com.ecc.content.application.port.out;

public interface DashboardPort {
    // Chỉ số của Member
    int getTotalPoints(Long userId);
    int getCurrentLevel(Long userId);
    int countAttendedSessions(Long userId);
    int countUnreadNotifications(Long userId);
    int countUpcomingBookings(Long userId);
    int getCurrentStreak(Long userId);

    java.util.List<java.util.Map<String, Object>> getUpcomingSessions(Long userId);
    java.util.List<java.util.Map<String, Object>> getOngoingSessions(Long userId);
    java.util.List<java.util.Map<String, Object>> getClosedSessions(Long userId);

    // Chỉ số của Admin
    int countTotalUsers();
    int countNewUsersThisMonth();
    int countActiveSessions();
    int countTotalCampaignsSent();
}