package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.api.dto.request.VocabularyHighlightRequest;
import com.ecc.session.api.dto.request.WarnUserRequest;
import com.ecc.session.application.service.ModerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/moderation")
@RequiredArgsConstructor
public class ModerationController {

    private final ModerationService moderationService;

    @PostMapping("/warn")
    @PreAuthorize("isAuthenticated()") // Hoặc kiểm tra chi tiết quyền Moderator
    public ResponseEntity<ApiResponse<Void>> warnUser(
            @Valid @RequestBody WarnUserRequest request,
            Authentication principal) {
        Long userId = Long.parseLong(principal.getName());
        moderationService.warnUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/vocabulary")
    @PreAuthorize("isAuthenticated()") // Hoặc kiểm tra chi tiết quyền Moderator
    public ResponseEntity<ApiResponse<Void>> highlightVocabulary(
            @Valid @RequestBody VocabularyHighlightRequest request,
            Authentication principal) {
        Long userId = Long.parseLong(principal.getName());
        moderationService.highlightVocabulary(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
