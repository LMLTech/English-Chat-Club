package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.common.event.SessionCompletedEvent;
import com.ecc.common.event.VocabularyPraisedEvent;
import com.ecc.common.event.ReferralRewardEligibleEvent;
import com.ecc.community.application.service.BadgeEvaluatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller TEST – Chỉ dùng để test thủ công trong môi trường dev.
 * Cho phép trigger các DomainEvent để kiểm tra luồng Gamification.
 *
 * TODO: Xóa hoặc comment lại trước khi deploy production.
 */
@RestController
@RequestMapping("/api/community/test")
@RequiredArgsConstructor
public class GamificationTestController {

    private final ApplicationEventPublisher eventPublisher;
    private final BadgeEvaluatorService badgeEvaluatorService;

    /**
     * POST /api/community/test/session-completed
     * Giả lập hoàn thành 1 session: user hiện tại nói 120s, gửi 15 tin nhắn.
     * Dự kiến cộng: 5 (base) + 2 (120s/60) + 1 (15msg/10) = 8 điểm
     */
    @PostMapping("/session-completed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> testSessionCompleted(
            @RequestParam(defaultValue = "120") int speakingSeconds,
            @RequestParam(defaultValue = "15") int messageCount,
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());

        SessionCompletedEvent event = new SessionCompletedEvent(
                999L,                                    // sessionId test
                Map.of(userId, speakingSeconds),         // userSpeakingSeconds
                Map.of(userId, messageCount)             // userMessageCounts
        );
        eventPublisher.publishEvent(event);

        int bonus = speakingSeconds / 60 + messageCount / 10;
        return ResponseEntity.ok(ApiResponse.success(
                String.format("✅ Đã publish SessionCompletedEvent cho userId=%d | Dự kiến +%d điểm (5 base + %d bonus)",
                        userId, 5 + bonus, bonus)));
    }

    /**
     * POST /api/community/test/vocabulary-praised?praisedUserId=2
     * Giả lập khen từ vựng → +5 điểm cho praisedUserId.
     */
    @PostMapping("/vocabulary-praised")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> testVocabularyPraised(
            @RequestParam Long praisedUserId,
            Authentication authentication) {

        Long myId = Long.parseLong(authentication.getName());

        VocabularyPraisedEvent event = new VocabularyPraisedEvent(
                999L,        // sessionId
                myId,        // người khen (highlightedByUserId)
                praisedUserId, // người được khen
                "excellent"  // từ được khen
        );
        eventPublisher.publishEvent(event);

        return ResponseEntity.ok(ApiResponse.success(
                "✅ Đã publish VocabularyPraisedEvent → +5 điểm cho userId=" + praisedUserId));
    }

    /**
     * POST /api/community/test/referral?referredUserId=2
     * Giả lập referral thành công → +50 điểm cho cả 2 bên.
     */
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

    /**
     * POST /api/community/test/evaluate-badges
     * Trigger BadgeEvaluator thủ công cho user hiện tại.
     */
    @PostMapping("/evaluate-badges")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> testEvaluateBadges(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        int awarded = badgeEvaluatorService.evaluateForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(
                "✅ Badge evaluation xong → trao " + awarded + " badge mới cho userId=" + userId));
    }
}
