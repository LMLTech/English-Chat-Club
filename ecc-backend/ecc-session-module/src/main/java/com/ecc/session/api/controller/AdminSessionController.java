package com.ecc.session.api.controller;

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

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<SessionResponse>> approveSession(@PathVariable Long id) {
        Session session = manageSessionUseCase.approveSession(id);
        return ResponseEntity.ok(ApiResponse.success(SessionResponse.fromEntity(session)));
    }
}