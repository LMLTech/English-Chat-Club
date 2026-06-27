package com.ecc.community.application.service;

import com.ecc.common.event.BadgeAwardedEvent;
import com.ecc.common.event.LevelUpEvent;
import com.ecc.common.event.ReferralRewardEligibleEvent;
import com.ecc.common.event.SessionCompletedEvent;
import com.ecc.common.event.VocabularyPraisedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Lắng nghe các DomainEvent từ các module khác để cộng/trừ điểm.
 *
 * Công thức điểm:
 *   SessionCompletedEvent : base 5đ + 1đ/60s nói + 1đ/10 tin nhắn
 *   VocabularyPraisedEvent: +5đ cho người được khen
 *   ReferralRewardEligibleEvent: +50đ cho cả người giới thiệu và người mới
 *   BadgeAwardedEvent: chỉ log, điểm đã cộng ở BadgeEvaluator
 *   LevelUpEvent: chỉ log
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GamificationEventListener {

    private static final int BASE_SESSION_POINTS         = 5;
    private static final int VOCABULARY_PRAISE_POINTS    = 5;
    private static final int REFERRAL_REWARD_POINTS      = 50;

    private final PointsCalculatorService pointsCalculatorService;

    @EventListener
    @Async
    public void onSessionCompleted(SessionCompletedEvent event) {
        log.info("[Gamification] 🎙️ SessionCompleted sessionId={} | {} user(s)",
                event.getSessionId(), event.getUserSpeakingSeconds().size());

        // Duyệt qua tất cả user tham gia session
        for (Map.Entry<Long, Integer> entry : event.getUserSpeakingSeconds().entrySet()) {
            Long userId = entry.getKey();
            int speakingSeconds = entry.getValue();
            int messageCounts = event.getUserMessageCounts().getOrDefault(userId, 0);

            // Công thức: base 5đ + 1đ/60s + 1đ/10 tin nhắn
            int bonusSpeaking  = speakingSeconds / 60;
            int bonusMessage   = messageCounts / 10;
            int totalPoints    = BASE_SESSION_POINTS + bonusSpeaking + bonusMessage;

            String desc = String.format("Session #%d – %ds phát biểu, %d tin nhắn",
                    event.getSessionId(), speakingSeconds, messageCounts);

            pointsCalculatorService.addPoints(userId, totalPoints, "SESSION_COMPLETED", desc);
        }
    }

    @EventListener
    @Async
    public void onVocabularyPraised(VocabularyPraisedEvent event) {
        log.info("[Gamification] 📚 VocabularyPraised: praisedUserId={}, word={}",
                event.getPraisedUserId(), event.getWord());

        String desc = String.format("Từ vựng \"%s\" được khen trong session #%d",
                event.getWord(), event.getSessionId());
        pointsCalculatorService.addPoints(
                event.getPraisedUserId(),
                VOCABULARY_PRAISE_POINTS,
                "VOCABULARY_PRAISED",
                desc);
    }

    @EventListener
    @Async
    public void onReferralRewardEligible(ReferralRewardEligibleEvent event) {
        log.info("[Gamification] 🎁 ReferralReward: referrerId={}, referredUserId={}",
                event.getReferrerId(), event.getReferredUserId());

        // Người giới thiệu
        pointsCalculatorService.addPoints(
                event.getReferrerId(),
                REFERRAL_REWARD_POINTS,
                "REFERRAL_REWARD",
                "Giới thiệu thành công userId=" + event.getReferredUserId());

        // Người được giới thiệu
        pointsCalculatorService.addPoints(
                event.getReferredUserId(),
                REFERRAL_REWARD_POINTS,
                "REFERRAL_REWARD",
                "Được giới thiệu bởi userId=" + event.getReferrerId());
    }

    @EventListener
    public void onBadgeAwarded(BadgeAwardedEvent event) {
        log.info("[Gamification] 🏅 BadgeAwarded: userId={}, badgeId={}",
                event.getUserId(), event.getBadgeId());
    }

    @EventListener
    public void onLevelUp(LevelUpEvent event) {
        log.info("[Gamification] ⬆️ LevelUp: userId={} → Level {}",
                event.getUserId(), event.getNewLevel());
        // TODO: Gửi notification cho user (khi có notification module)
    }
}
