package com.ecc.community.application.listener;

import com.ecc.common.event.BadgeAwardedEvent;
import com.ecc.common.event.LevelUpEvent;
import com.ecc.common.event.ReferralRewardEligibleEvent;
import com.ecc.common.event.SessionCompletedEvent;
import com.ecc.common.event.VocabularyPraisedEvent;
import com.ecc.community.application.port.in.ReferralRewardUseCase;
import com.ecc.community.application.service.PointsCalculatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GamificationEventListener {

    private static final int BASE_SESSION_POINTS         = 5;
    private static final int VOCABULARY_PRAISE_POINTS    = 5;

    private final PointsCalculatorService pointsCalculatorService; // Xử lý điểm (Flow 3.1)
    private final ReferralRewardUseCase referralRewardUseCase;     // Xử lý mã giới thiệu (Flow 3.6)

    // 1. CÁC SỰ KIỆN TỪ FLOW 3.1

    @EventListener
    @Async
    public void onSessionCompleted(SessionCompletedEvent event) {
        log.info("[Gamification] 🎙️ SessionCompleted sessionId={} | {} user(s)",
                event.getSessionId(), event.getUserSpeakingSeconds().size());

        for (Map.Entry<Long, Integer> entry : event.getUserSpeakingSeconds().entrySet()) {
            Long userId = entry.getKey();
            int speakingSeconds = entry.getValue();
            int messageCounts = event.getUserMessageCounts().getOrDefault(userId, 0);

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
    public void onBadgeAwarded(BadgeAwardedEvent event) {
        log.info("[Gamification] 🏅 BadgeAwarded: userId={}, badgeId={}",
                event.getUserId(), event.getBadgeId());
    }

    @EventListener
    public void onLevelUp(LevelUpEvent event) {
        log.info("[Gamification] ⬆️ LevelUp: userId={} → Level {}",
                event.getUserId(), event.getNewLevel());
        // TODO: Gửi notification cho user
    }
    // 2. SỰ KIỆN TỪ FLOW 3.6 (MÃ GIỚI THIỆU)

    @Async
    @EventListener
    public void handleReferralRewardEligible(ReferralRewardEligibleEvent event) {
        Long newbieId = event.getReferredUserId();
        Long referrerId = event.getReferrerId();

        log.info("[Gamification Listener] 🎁 Bắt được sự kiện kiểm tra mã giới thiệu. Người giới thiệu: {}, Người mới: {}",
                referrerId, newbieId);

        try {
            // Đẩy vào UseCase để đếm số buổi học, tự cộng điểm và update DB (thay vì tự cộng thẳng)
            referralRewardUseCase.checkAndProcessReferralReward(newbieId);
        } catch (Exception e) {
            log.error("[Gamification Listener] Lỗi khi xử lý thưởng giới thiệu cho User {}: {}", newbieId, e.getMessage());
        }
    }
}