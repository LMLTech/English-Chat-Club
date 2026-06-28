package com.ecc.community.application.service;

import com.ecc.common.event.BadgeAwardedEvent;
import com.ecc.community.application.port.out.BadgePort;
import com.ecc.community.application.port.out.MemberPointsPort;
import com.ecc.community.application.port.out.PointTransactionPort;
import com.ecc.community.application.port.out.UserBadgePort;
import com.ecc.community.domain.model.Badge;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.UserBadge;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class BadgeEvaluatorService {

    private final BadgePort badgePort;
    private final UserBadgePort userBadgePort;
    private final MemberPointsPort memberPointsPort;
    private final PointTransactionPort pointTransactionPort;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public int evaluateForUser(Long userId) {
        MemberPoints member = memberPointsPort.findByUserId(userId).orElse(null);
        if (member == null) return 0;
        return evaluateForUser(member);
    }

    private int evaluateForUser(MemberPoints member) {
        Long userId = member.getUserId();
        int totalPoints = member.getTotalPoints();
        int awarded = 0;

        long sessionCount = pointTransactionPort.findByUserIdOrderByOccurredAtDesc(userId)
                .stream().filter(tx -> "SESSION_COMPLETED".equals(tx.getReason())).count();
        long vocabularyCount = pointTransactionPort.findByUserIdOrderByOccurredAtDesc(userId)
                .stream().filter(tx -> "VOCABULARY_PRAISED".equals(tx.getReason())).count();
        boolean hasReferral = pointTransactionPort.findByUserIdOrderByOccurredAtDesc(userId)
                .stream().anyMatch(tx -> "REFERRAL_REWARD".equals(tx.getReason()));

        if (sessionCount >= 1)  awarded += awardBadgeIfEligible(userId, "FIRST_SESSION");
        if (sessionCount >= 10) awarded += awardBadgeIfEligible(userId, "SESSIONS_10");
        if (sessionCount >= 50) awarded += awardBadgeIfEligible(userId, "SESSIONS_50");
        if (hasReferral)        awarded += awardBadgeIfEligible(userId, "REFERRER");
        if (vocabularyCount >= 10) awarded += awardBadgeIfEligible(userId, "VOCABULARY_STAR");
        if (totalPoints >= 500)  awarded += awardBadgeIfEligible(userId, "POINTS_500");
        if (totalPoints >= 2000) awarded += awardBadgeIfEligible(userId, "POINTS_2000");

        return awarded;
    }

    private int awardBadgeIfEligible(Long userId, String condition) {
        if (userBadgePort.existsByUserIdAndBadge_Condition(userId, condition)) {
            return 0;
        }

        Badge badge = badgePort.findByCondition(condition).orElse(null);
        if (badge == null) {
            log.warn("[BadgeEvaluator] Badge với condition '{}' chưa được seed vào DB", condition);
            return 0;
        }

        UserBadge userBadge = UserBadge.builder()
                .userId(userId)
                .badge(badge)
                .build();
        userBadgePort.save(userBadge);

        eventPublisher.publishEvent(new BadgeAwardedEvent(userId, badge.getId()));

        log.info("[BadgeEvaluator] 🏅 Trao badge '{}' cho userId={}", badge.getName(), userId);
        return 1;
    }
}