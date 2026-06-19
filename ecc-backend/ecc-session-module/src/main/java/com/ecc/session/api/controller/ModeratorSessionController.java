package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.api.dto.request.SessionRequest;
import com.ecc.session.api.dto.response.SessionResponse;
import com.ecc.session.application.port.in.ManageSessionUseCase;
import com.ecc.session.domain.model.Session;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/moderator/sessions")
@PreAuthorize("hasAuthority('MODERATOR')") // Chỉ Moderator mới có quyền gõ cửa
@RequiredArgsConstructor
public class ModeratorSessionController {

    private final ManageSessionUseCase manageSessionUseCase;

    private Long getCurrentUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(
            @Valid @RequestBody SessionRequest request,
            Authentication authentication) {

        Long moderatorId = getCurrentUserId(authentication);
        Session session = manageSessionUseCase.createSession(moderatorId, request);
        return ResponseEntity.ok(ApiResponse.success(SessionResponse.fromEntity(session)));
    }
}