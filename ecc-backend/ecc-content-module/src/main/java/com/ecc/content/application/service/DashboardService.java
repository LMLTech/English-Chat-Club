package com.ecc.content.application.service;

import com.ecc.content.api.dto.response.AdminDashboardResponse;
import com.ecc.content.api.dto.response.MemberDashboardResponse;
import com.ecc.content.application.port.in.DashboardUseCase;
import com.ecc.content.application.port.out.DashboardPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService implements DashboardUseCase {

    private final DashboardPort dashboardPort;

    @Override
    public MemberDashboardResponse getMemberDashboard(Long userId) {
        log.info("[Dashboard] Đang tổng hợp dữ liệu cho Member {}", userId);
        return MemberDashboardResponse.builder()
                .totalPoints(dashboardPort.getTotalPoints(userId))
                .currentLevel(dashboardPort.getCurrentLevel(userId))
                .totalSessionsAttended(dashboardPort.countAttendedSessions(userId))
                .unreadNotifications(dashboardPort.countUnreadNotifications(userId))
                .build();
    }

    @Override
    public AdminDashboardResponse getAdminDashboard() {
        log.info("[Dashboard] Đang tổng hợp dữ liệu cho Admin");
        return AdminDashboardResponse.builder()
                .totalUsers(dashboardPort.countTotalUsers())
                .newUsersThisMonth(dashboardPort.countNewUsersThisMonth())
                .activeSessions(dashboardPort.countActiveSessions())
                .totalCampaignsSent(dashboardPort.countTotalCampaignsSent())
                .build();
    }
}