package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.application.service.VoiceRecordService;
import com.ecc.session.domain.model.UserVoiceRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/voice")
@RequiredArgsConstructor
public class VoiceRecordRestController {

    private final VoiceRecordService voiceRecordService;

    @PostMapping("/record")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Object>> uploadVoiceRecord(
            @RequestParam(value = "sessionId", required = false) Long sessionId,
            @RequestParam(value = "duration", required = false) Integer duration,
            @RequestParam("file") MultipartFile file) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error(400, "File ghi âm trống!"));
            }
            // Lấy userId chuẩn xác từ Spring Security Context
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = Long.parseLong(principal);

            UserVoiceRecord savedRecord = voiceRecordService.saveVoiceRecord(userId, sessionId, file, duration);

            return ResponseEntity.ok(ApiResponse.success(savedRecord.getAudioUrl()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error(500, "Lỗi khi lưu file: " + e.getMessage()));
        }
    }
}