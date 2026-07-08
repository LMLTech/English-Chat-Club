package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.community.api.dto.request.ChallengeCreateRequest;
import com.ecc.community.api.dto.response.ChallengeResponse;
import com.ecc.community.application.port.in.ChallengeUseCase;
import com.ecc.community.domain.model.Challenge;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/community/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeUseCase challengeUseCase;

    // Admin tạo thử thách
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<ChallengeResponse>> createChallenge(
            Authentication authentication,
            @Valid @RequestBody ChallengeCreateRequest request) {
        Long adminId = Long.parseLong(authentication.getName());
        Challenge challenge = challengeUseCase.createChallenge(adminId, request);
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(challenge)));
    }

    // Xem danh sách thử thách đang mở
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<Page<ChallengeResponse>>> getActiveChallenges(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ChallengeResponse> challenges = challengeUseCase.getActiveChallenges(PageRequest.of(page, size))
                .map(this::mapToResponse);
        return ResponseEntity.ok(ApiResponse.success(challenges));
    }

    // Member bấm tham gia
    @PostMapping("/{challengeId}/join")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> joinChallenge(
            Authentication authentication,
            @PathVariable Long challengeId) {
        Long userId = Long.parseLong(authentication.getName());
        challengeUseCase.joinChallenge(userId, challengeId);
        return ResponseEntity.ok(ApiResponse.success("Tham gia thử thách thành công! Hãy cố gắng hoàn thành nhé."));
    }

    // Hàm phụ trợ chuyển Entity sang DTO
    private ChallengeResponse mapToResponse(Challenge challenge) {
        return ChallengeResponse.builder()
                .id(challenge.getId())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .startDate(challenge.getStartDate())
                .endDate(challenge.getEndDate())
                .conditionExpression(challenge.getConditionExpression())
                .rewardPoints(challenge.getRewardPoints())
                .rewardBadgeId(challenge.getRewardBadgeId())
                .isActive(challenge.isActive())
                .build();
    }
}