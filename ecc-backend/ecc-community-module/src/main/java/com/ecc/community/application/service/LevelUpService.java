package com.ecc.community.application.service;

import com.ecc.common.event.LevelUpEvent;
import com.ecc.community.domain.model.LevelConfig;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.infrastructure.repository.LevelConfigRepository;
import com.ecc.community.infrastructure.repository.MemberPointsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service kiểm tra điều kiện lên level sau khi điểm thay đổi.
 * Publish LevelUpEvent nếu user lên level mới.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LevelUpService {

    private final LevelConfigRepository levelConfigRepository;
    private final MemberPointsRepository memberPointsRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * So sánh tổng điểm hiện tại với LevelConfig.
     * Nếu level mới > level hiện tại → cập nhật và publish LevelUpEvent.
     *
     * @param memberPoints Đối tượng MemberPoints đang được xử lý (tránh query thừa)
     * @param newTotal     Tổng điểm mới
     */
    @Transactional
    public void checkAndLevelUp(MemberPoints memberPoints, int newTotal) {
        // Tìm level cao nhất mà user đủ điều kiện
        LevelConfig eligibleLevel = levelConfigRepository
                .findTopByRequiredPointsLessThanEqualOrderByRequiredPointsDesc(newTotal)
                .orElse(null);

        if (eligibleLevel == null) return;

        int newLevel = eligibleLevel.getLevel();
        int currentLevel = memberPoints.getCurrentLevel();

        if (newLevel > currentLevel) {
            memberPoints.setCurrentLevel(newLevel);
            memberPointsRepository.save(memberPoints);

            // Publish LevelUpEvent để các module khác có thể lắng nghe
            eventPublisher.publishEvent(new LevelUpEvent(memberPoints.getUserId(), newLevel));

            log.info("[Gamification] 🎉 userId={} lên LEVEL {} ({})",
                    memberPoints.getUserId(), newLevel, eligibleLevel.getTitle());
        }
    }
}
