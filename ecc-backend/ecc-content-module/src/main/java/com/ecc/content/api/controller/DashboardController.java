package com.ecc.content.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.content.api.dto.response.AdminDashboardResponse;
import com.ecc.content.api.dto.response.MemberDashboardResponse;
import com.ecc.content.application.port.in.DashboardUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardUseCase dashboardUseCase;

    // 1. Dành cho màn hình chính của Học viên (MEMBER)
    @GetMapping("/member")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MemberDashboardResponse>> getMemberDashboard(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        MemberDashboardResponse response = dashboardUseCase.getMemberDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 2. Dành cho trang quản trị thống kê của Quản trị viên (ADMIN)
    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse response = dashboardUseCase.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}