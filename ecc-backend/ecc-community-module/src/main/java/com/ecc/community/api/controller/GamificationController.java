package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.community.api.dto.response.BadgeResponse;
import com.ecc.community.api.dto.response.MemberPointsResponse;
import com.ecc.community.api.dto.response.PointTransactionResponse;
import com.ecc.community.application.port.in.GamificationUseCase;
import com.ecc.community.application.port.out.LevelConfigPort;
import com.ecc.community.application.service.BadgeEvaluatorService;
import com.ecc.community.domain.model.LevelConfig;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.PointTransaction;
import com.ecc.community.domain.model.UserBadge;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller gamification dành cho Member và Admin.
 */
@RestController
// SỬA LỖI 1: Đưa đường dẫn gốc về /api/community để không bị dính /me vào hàm Admin
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationUseCase gamificationUseCase;

    // SỬA LỖI 2: Dùng Port thay vì dùng Repository trực tiếp
    private final LevelConfigPort levelConfigPort;

    private final BadgeEvaluatorService badgeEvaluatorService;

    /**
     * GET /api/community/me/points
     */
    @GetMapping("/me/points")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<MemberPointsResponse>> getMyPoints(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        MemberPoints points = gamificationUseCase.getMyPoints(userId);

        // Lấy tên level thông qua Port chuẩn Hexagonal
        String levelTitle = levelConfigPort.findById(points.getCurrentLevel())
                .map(LevelConfig::getTitle)
                .orElse("Unknown");

        MemberPointsResponse response = MemberPointsResponse.builder()
                .userId(points.getUserId())
                .totalPoints(points.getTotalPoints())
                .currentLevel(points.getCurrentLevel())
                .levelTitle(levelTitle)
                .updatedAt(points.getUpdatedAt())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/community/me/transactions
     */
    @GetMapping("/me/transactions")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<PointTransactionResponse>>> getMyTransactions(
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());
        List<PointTransaction> txList = gamificationUseCase.getMyTransactions(userId);

        List<PointTransactionResponse> response = txList.stream()
                .map(tx -> PointTransactionResponse.builder()
                        .id(tx.getId())
                        .points(tx.getPoints())
                        .reason(tx.getReason())
                        .description(tx.getDescription())
                        .occurredAt(tx.getOccurredAt())
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/community/me/badges
     */
    @GetMapping("/me/badges")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getMyBadges(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        List<UserBadge> userBadges = gamificationUseCase.getMyBadges(userId);

        List<BadgeResponse> response = userBadges.stream()
                .map(ub -> BadgeResponse.builder()
                        .badgeId(ub.getBadge().getId())
                        .name(ub.getBadge().getName())
                        .description(ub.getBadge().getDescription())
                        .iconUrl(ub.getBadge().getIconUrl())
                        .condition(ub.getBadge().getCondition())
                        .awardedAt(ub.getAwardedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /api/community/admin/badges/evaluate/{userId}
     */
    @PostMapping("/admin/badges/evaluate/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> triggerBadgeEvaluation(@PathVariable Long userId) {
        int awarded = badgeEvaluatorService.evaluateForUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Trao " + awarded + " badge mới cho userId=" + userId));
    }
}