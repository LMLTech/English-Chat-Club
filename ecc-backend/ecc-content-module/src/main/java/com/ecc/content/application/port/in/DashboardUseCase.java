package com.ecc.content.application.port.in;

import com.ecc.content.api.dto.response.AdminDashboardResponse;
import com.ecc.content.api.dto.response.MemberDashboardResponse;

public interface DashboardUseCase {
    MemberDashboardResponse getMemberDashboard(Long userId);
    AdminDashboardResponse getAdminDashboard();
}