package com.ecc.community.application.service;

import com.ecc.community.application.port.out.MemberPointsPort;
import com.ecc.community.application.port.out.PointTransactionPort;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.PointTransaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PointsCalculatorService {

    private static final int MAX_RETRY = 3;

    // CHUẨN HEXAGONAL: Dùng Port
    private final MemberPointsPort memberPointsPort;
    private final PointTransactionPort pointTransactionPort;

    private final LevelUpService levelUpService;
    private final LeaderboardService leaderboardService;

    @Transactional
    public void addPoints(Long userId, int points, String reason, String description) {
        for (int attempt = 1; attempt <= MAX_RETRY; attempt++) {
            try {
                doAddPoints(userId, points, reason, description);
                return;
            } catch (ObjectOptimisticLockingFailureException e) {
                if (attempt == MAX_RETRY) {
                    log.error("[Gamification] Optimistic lock failed sau {} lần retry cho userId={}, reason={}",
                            MAX_RETRY, userId, reason);
                    throw e;
                }
                log.warn("[Gamification] Optimistic lock conflict, retry {}/{} cho userId={}", attempt, MAX_RETRY, userId);
            }
        }
    }

    @Transactional
    public void addPoints(Long userId, int points, String reason) {
        addPoints(userId, points, reason, null);
    }

    private void doAddPoints(Long userId, int points, String reason, String description) {
        MemberPoints memberPoints = memberPointsPort.findByUserId(userId)
                .orElseGet(() -> memberPointsPort.save(
                        MemberPoints.builder()
                                .userId(userId)
                                .totalPoints(0)
                                .currentLevel(1)
                                .build()
                ));

        int newTotal = Math.max(0, memberPoints.getTotalPoints() + points);
        memberPoints.setTotalPoints(newTotal);
        memberPointsPort.save(memberPoints);

        PointTransaction tx = PointTransaction.builder()
                .userId(userId)
                .points(points)
                .reason(reason)
                .description(description)
                .build();
        pointTransactionPort.save(tx);

        leaderboardService.updateScore(userId, points);

        levelUpService.checkAndLevelUp(memberPoints, newTotal);

        log.info("[Gamification] ✅ userId={} | {} điểm | reason={} | tổng={}", userId, points, reason, newTotal);
    }
}