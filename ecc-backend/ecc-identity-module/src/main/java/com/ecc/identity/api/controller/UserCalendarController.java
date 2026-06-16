package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.request.ConnectCalendarRequest;
import com.ecc.identity.application.port.in.GoogleCalendarUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/calendar")
@RequiredArgsConstructor
public class UserCalendarController {

    private final GoogleCalendarUseCase googleCalendarUseCase;

    @PostMapping("/connect")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> connectCalendar(
            @RequestBody ConnectCalendarRequest request,
            Authentication authentication) {

        // Lấy userId từ JWT token, không từ request body (bảo mật)
        Long userId = Long.parseLong(authentication.getName());
        googleCalendarUseCase.connectGoogleCalendar(userId, request.getAuthCode());

        return ResponseEntity.ok(ApiResponse.success("Đồng bộ Google Calendar thành công!"));
    }

    @DeleteMapping("/disconnect")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> disconnectCalendar(
            Authentication authentication) {

        // Lấy userId từ JWT token
        Long userId = Long.parseLong(authentication.getName());
        googleCalendarUseCase.disconnectGoogleCalendar(userId);

        return ResponseEntity.ok(ApiResponse.success("Đã ngắt kết nối Google Calendar!"));
    }
}