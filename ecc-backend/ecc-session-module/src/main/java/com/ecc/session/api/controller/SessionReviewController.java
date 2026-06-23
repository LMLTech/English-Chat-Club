package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.api.dto.request.CreateReviewRequest;
import com.ecc.session.application.service.SessionReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionReviewController {

    private final SessionReviewService sessionReviewService;

    @PostMapping("/{id}/review")
    @PreAuthorize("isAuthenticated()") // Bắt buộc phải đăng nhập
    public ResponseEntity<ApiResponse<Void>> submitReview(
            @PathVariable Long id,
            @Valid @RequestBody CreateReviewRequest request,
            Authentication principal) {

        Long reviewerId = Long.parseLong(principal.getName());
        sessionReviewService.createReview(id, reviewerId, request);

        return ResponseEntity.ok(ApiResponse.success(null));
    }
}