package com.ecc.community.application.service;

import com.ecc.common.event.LevelUpEvent;
import com.ecc.community.application.port.out.LevelConfigPort;
import com.ecc.community.application.port.out.MemberPointsPort;
import com.ecc.community.domain.model.LevelConfig;
import com.ecc.community.domain.model.MemberPoints;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LevelUpService {

    private final LevelConfigPort levelConfigPort;
    private final MemberPointsPort memberPointsPort;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void checkAndLevelUp(MemberPoints memberPoints, int newTotal) {
        LevelConfig eligibleLevel = levelConfigPort
                .findTopByRequiredPointsLessThanEqualOrderByRequiredPointsDesc(newTotal)
                .orElse(null);

        if (eligibleLevel == null) return;

        int newLevel = eligibleLevel.getLevel();
        int currentLevel = memberPoints.getCurrentLevel();

        if (newLevel > currentLevel) {
            memberPoints.setCurrentLevel(newLevel);
            memberPointsPort.save(memberPoints);

            eventPublisher.publishEvent(new LevelUpEvent(memberPoints.getUserId(), newLevel));

            log.info("[Gamification] 🎉 userId={} lên LEVEL {} ({})",
                    memberPoints.getUserId(), newLevel, eligibleLevel.getTitle());
        } else {
            // ALWAYS publish to ensure CEFR level is synced in case of failures or manual data changes
            eventPublisher.publishEvent(new LevelUpEvent(memberPoints.getUserId(), currentLevel));
        }
    }
}