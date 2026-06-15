package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.request.ConnectCalendarRequest;
import com.ecc.identity.api.dto.request.DisconnectCalendarRequest;
import com.ecc.identity.application.port.in.GoogleCalendarUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/calendar")
@RequiredArgsConstructor
public class UserCalendarController {

    private final GoogleCalendarUseCase googleCalendarUseCase;

    @PostMapping("/connect")
    public ResponseEntity<ApiResponse<String>> connectCalendar(
            @RequestBody ConnectCalendarRequest request) {

        // Lấy trực tiếp userId và authCode từ request body gửi lên
        googleCalendarUseCase.connectGoogleCalendar(request.getUserId(), request.getAuthCode());

        return ResponseEntity.ok(ApiResponse.success("Đồng bộ Google Calendar thành công!"));
    }

    @DeleteMapping("/disconnect")
    public ResponseEntity<ApiResponse<String>> disconnectCalendar(
            @RequestBody DisconnectCalendarRequest request) {

        // Lấy trực tiếp userId từ request body gửi lên
        googleCalendarUseCase.disconnectGoogleCalendar(request.getUserId());

        return ResponseEntity.ok(ApiResponse.success("Đã ngắt kết nối Google Calendar!"));
    }
}