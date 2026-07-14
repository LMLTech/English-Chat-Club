package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.api.dto.request.SessionRequest;
import com.ecc.session.api.dto.response.SessionResponse;
import com.ecc.session.application.port.in.ManageSessionUseCase;
import com.ecc.session.application.service.ModerationService;
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
    private final ModerationService moderationService;
    private final com.ecc.session.application.port.in.ManageSessionReviewUseCase manageSessionReviewUseCase;

    private Long getCurrentUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<SessionResponse>>> getMySessions(
            Authentication authentication) {
        Long moderatorId = getCurrentUserId(authentication);
        java.util.List<SessionResponse> sessions = manageSessionUseCase.getModeratorSessions(moderatorId).stream()
                .map(SessionResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<java.util.List<com.ecc.session.api.dto.response.ReviewResponse>>> getMyReviews(
            Authentication authentication) {
        Long moderatorId = getCurrentUserId(authentication);
        java.util.List<com.ecc.session.api.dto.response.ReviewResponse> reviews = manageSessionReviewUseCase.getReviewsForModerator(moderatorId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(
            @Valid @RequestBody SessionRequest request,
            Authentication authentication) {

        Long moderatorId = getCurrentUserId(authentication);
        Session session = manageSessionUseCase.createSession(moderatorId, request);
        return ResponseEntity.ok(ApiResponse.success(SessionResponse.fromEntity(session)));
    }

    @PostMapping("/upload-cover")
    public ResponseEntity<ApiResponse<String>> uploadCover(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads/covers");
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }
            String fileName = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = uploadPath.resolve(fileName);
            file.transferTo(filePath.toFile());
            return ResponseEntity.ok(ApiResponse.success("/uploads/covers/" + fileName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Lỗi khi upload ảnh"));
        }
    }

    @PostMapping("/{id}/summary")
    public ResponseEntity<ApiResponse<Void>> createSessionSummary(
            @PathVariable Long id,
            @Valid @RequestBody com.ecc.session.api.dto.request.SessionSummaryRequest request,
            Authentication authentication) {
        
        Long moderatorId = getCurrentUserId(authentication);
        moderationService.createSessionSummary(id, moderatorId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}