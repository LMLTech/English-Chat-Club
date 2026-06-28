package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.common.event.SessionCompletedEvent;
import com.ecc.common.event.VocabularyPraisedEvent;
import com.ecc.common.event.ReferralRewardEligibleEvent;
import com.ecc.community.application.service.BadgeEvaluatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller TEST – Chỉ dùng để test thủ công trong môi trường dev.
 * Cho phép trigger các DomainEvent để kiểm tra luồng Gamification.
 * Đã được khóa an toàn bằng @Profile("dev").
 */
@RestController
@RequestMapping("/api/community/test")
@RequiredArgsConstructor
@Profile("dev")
public class GamificationTestController {

    private final ApplicationEventPublisher eventPublisher;
    private final BadgeEvaluatorService badgeEvaluatorService;

    @PostMapping("/session-completed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> testSessionCompleted(
            @RequestParam(defaultValue = "120") int speakingSeconds,
            @RequestParam(defaultValue = "15") int messageCount,
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());

        SessionCompletedEvent event = new SessionCompletedEvent(
                999L,
                Map.of(userId, speakingSeconds),
                Map.of(userId, messageCount)
        );
        eventPublisher.publishEvent(event);

        int bonus = speakingSeconds / 60 + messageCount / 10;
        return ResponseEntity.ok(ApiResponse.success(
                String.format("✅ Đã publish SessionCompletedEvent cho userId=%d | Dự kiến +%d điểm (5 base + %d bonus)",
                        userId, 5 + bonus, bonus)));
    }

    @PostMapping("/vocabulary-praised")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> testVocabularyPraised(
            @RequestParam Long praisedUserId,
            Authentication authentication) {

        Long myId = Long.parseLong(authentication.getName());

        VocabularyPraisedEvent event = new VocabularyPraisedEvent(
                999L,
                myId,
                praisedUserId,
                "excellent"
        );
        eventPublisher.publishEvent(event);

        return ResponseEntity.ok(ApiResponse.success(
                "✅ Đã publish VocabularyPraisedEvent → +5 điểm cho userId=" + praisedUserId));
    }

    @PostMapping("/referral")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> testReferral(
            @RequestParam Long referredUserId,
            Authentication authentication) {

        Long referrerId = Long.parseLong(authentication.getName());

        ReferralRewardEligibleEvent event = new ReferralRewardEligibleEvent(referrerId, referredUserId);
        eventPublisher.publishEvent(event);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("✅ Đã publish ReferralRewardEligibleEvent → +50 điểm cho referrerId=%d và referredUserId=%d",
                        referrerId, referredUserId)));
    }

    @PostMapping("/evaluate-badges")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> testEvaluateBadges(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        int awarded = badgeEvaluatorService.evaluateForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(
                "✅ Badge evaluation xong → trao " + awarded + " badge mới cho userId=" + userId));
    }
}