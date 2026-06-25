package com.ecc.community.application.service;

import com.ecc.common.event.BadgeAwardedEvent;
import com.ecc.community.domain.model.Badge;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.UserBadge;
import com.ecc.community.infrastructure.repository.BadgeRepository;
import com.ecc.community.infrastructure.repository.MemberPointsRepository;
import com.ecc.community.infrastructure.repository.PointTransactionRepository;
import com.ecc.community.infrastructure.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Scheduled job chạy mỗi đêm để kiểm tra và trao badge.
 *
 * Điều kiện badge được kiểm tra:
 *   FIRST_SESSION     – hoàn thành ít nhất 1 session (totalPoints >= 5, tức là đã cộng ít nhất 1 SESSION_COMPLETED)
 *   SESSIONS_10       – hoàn thành 10 session (dựa vào count PointTransaction reason=SESSION_COMPLETED)
 *   SESSIONS_50       – hoàn thành 50 session
 *   REFERRER          – giới thiệu ít nhất 1 người (có PointTransaction reason=REFERRAL_REWARD)
 *   VOCABULARY_STAR   – từ vựng được khen ≥ 10 lần (count PointTransaction reason=VOCABULARY_PRAISED >= 10)
 *   POINTS_500        – tổng điểm đạt 500
 *   POINTS_2000       – tổng điểm đạt 2000
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BadgeEvaluatorService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final MemberPointsRepository memberPointsRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Chạy mỗi đêm lúc 02:00 để trao badge cho tất cả user.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void evaluateBadges() {
        log.info("[BadgeEvaluator] 🔍 Bắt đầu kiểm tra badge cho tất cả thành viên...");

        List<MemberPoints> allMembers = memberPointsRepository.findAll();
        int totalAwarded = 0;

        for (MemberPoints member : allMembers) {
            totalAwarded += evaluateForUser(member);
        }

        log.info("[BadgeEvaluator] ✅ Hoàn thành. Trao {} badge mới.", totalAwarded);
    }

    /**
     * Có thể gọi thủ công từ admin endpoint để trigger ngay (không cần chờ cron).
     */
    @Transactional
    public int evaluateForUser(Long userId) {
        MemberPoints member = memberPointsRepository.findByUserId(userId).orElse(null);
        if (member == null) return 0;
        return evaluateForUser(member);
    }

    private int evaluateForUser(MemberPoints member) {
        Long userId = member.getUserId();
        int totalPoints = member.getTotalPoints();
        int awarded = 0;

        // Đếm số lần SESSION_COMPLETED, VOCABULARY_PRAISED, REFERRAL_REWARD
        long sessionCount = pointTransactionRepository.findByUserIdOrderByOccurredAtDesc(userId)
                .stream().filter(tx -> "SESSION_COMPLETED".equals(tx.getReason())).count();
        long vocabularyCount = pointTransactionRepository.findByUserIdOrderByOccurredAtDesc(userId)
                .stream().filter(tx -> "VOCABULARY_PRAISED".equals(tx.getReason())).count();
        boolean hasReferral = pointTransactionRepository.findByUserIdOrderByOccurredAtDesc(userId)
                .stream().anyMatch(tx -> "REFERRAL_REWARD".equals(tx.getReason()));

        // Kiểm tra và trao từng badge
        if (sessionCount >= 1)  awarded += awardBadgeIfEligible(userId, "FIRST_SESSION");
        if (sessionCount >= 10) awarded += awardBadgeIfEligible(userId, "SESSIONS_10");
        if (sessionCount >= 50) awarded += awardBadgeIfEligible(userId, "SESSIONS_50");
        if (hasReferral)        awarded += awardBadgeIfEligible(userId, "REFERRER");
        if (vocabularyCount >= 10) awarded += awardBadgeIfEligible(userId, "VOCABULARY_STAR");
        if (totalPoints >= 500)  awarded += awardBadgeIfEligible(userId, "POINTS_500");
        if (totalPoints >= 2000) awarded += awardBadgeIfEligible(userId, "POINTS_2000");

        return awarded;
    }

    /**
     * Trao badge nếu user chưa có badge này.
     * Publish BadgeAwardedEvent sau khi trao.
     *
     * @return 1 nếu trao badge mới, 0 nếu đã có rồi
     */
    private int awardBadgeIfEligible(Long userId, String condition) {
        // Đã có rồi → bỏ qua
        if (userBadgeRepository.existsByUserIdAndBadge_Condition(userId, condition)) {
            return 0;
        }

        Badge badge = badgeRepository.findByCondition(condition).orElse(null);
        if (badge == null) {
            log.warn("[BadgeEvaluator] Badge với condition '{}' chưa được seed vào DB", condition);
            return 0;
        }

        UserBadge userBadge = UserBadge.builder()
                .userId(userId)
                .badge(badge)
                .build();
        userBadgeRepository.save(userBadge);

        // Publish event để log/notification
        eventPublisher.publishEvent(new BadgeAwardedEvent(userId, badge.getId()));

        log.info("[BadgeEvaluator] 🏅 Trao badge '{}' cho userId={}", badge.getName(), userId);
        return 1;
    }
}
