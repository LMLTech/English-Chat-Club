package com.ecc.session.api.controller;

import com.ecc.common.audit.Auditable;
import com.ecc.common.dto.ApiResponse;
import com.ecc.session.api.dto.response.SessionResponse;
import com.ecc.session.application.port.in.ManageSessionUseCase;
import com.ecc.session.domain.model.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/sessions")
@PreAuthorize("hasAuthority('ADMIN')") // Admin cầm trịch việc duyệt
@RequiredArgsConstructor
public class AdminSessionController {

    private final ManageSessionUseCase manageSessionUseCase;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<java.util.List<SessionResponse>>> getPendingSessions() {
        java.util.List<SessionResponse> pendingSessions = manageSessionUseCase.getPendingSessions().stream()
                .map(SessionResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(pendingSessions));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<java.util.List<SessionResponse>>> getActiveSessions() {
        java.util.List<SessionResponse> activeSessions = manageSessionUseCase.getActiveSessions().stream()
                .map(SessionResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(activeSessions));
    }

    @PutMapping("/{id}/approve")
    @Auditable(action = "APPROVE_SESSION", description = "Duyệt phiên học")
    public ResponseEntity<ApiResponse<SessionResponse>> approveSession(@PathVariable Long id) {
        Session session = manageSessionUseCase.approveSession(id);
        return ResponseEntity.ok(ApiResponse.success(SessionResponse.fromEntity(session)));
    }
}