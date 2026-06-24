package com.ecc.community.application.service;

import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.PointTransaction;
import com.ecc.community.infrastructure.repository.MemberPointsRepository;
import com.ecc.community.infrastructure.repository.PointTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service chịu trách nhiệm cộng/trừ điểm cho user.
 * Dùng optimistic lock (@Version trên MemberPoints) để tránh race condition.
 * Sau khi cập nhật điểm, gọi LevelUpService để kiểm tra điều kiện lên level.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PointsCalculatorService {

    private static final int MAX_RETRY = 3;

    private final MemberPointsRepository memberPointsRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final LevelUpService levelUpService;
    private final LeaderboardService leaderboardService;

    /**
     * Cộng điểm cho user và ghi PointTransaction.
     * Tự retry tối đa 3 lần nếu xảy ra optimistic lock conflict.
     *
     * @param userId      User nhận điểm
     * @param points      Số điểm (dương = cộng, âm = trừ)
     * @param reason      Lý do: SESSION_COMPLETED, VOCABULARY_PRAISED, REFERRAL_REWARD, LATE_CANCEL
     * @param description Mô tả chi tiết (có thể null)
     */
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

    // Overload tiện dụng không cần description
    @Transactional
    public void addPoints(Long userId, int points, String reason) {
        addPoints(userId, points, reason, null);
    }

    private void doAddPoints(Long userId, int points, String reason, String description) {
        // 1. Lấy hoặc tạo mới MemberPoints
        MemberPoints memberPoints = memberPointsRepository.findByUserId(userId)
                .orElseGet(() -> memberPointsRepository.save(
                        MemberPoints.builder()
                                .userId(userId)
                                .totalPoints(0)
                                .currentLevel(1)
                                .build()
                ));

        // 2. Cập nhật điểm
        int newTotal = Math.max(0, memberPoints.getTotalPoints() + points); // Không cho âm xuống dưới 0
        memberPoints.setTotalPoints(newTotal);
        memberPointsRepository.save(memberPoints); // @Version sẽ ném OptimisticLockException nếu conflict

        // 3. Ghi PointTransaction (audit log)
        PointTransaction tx = PointTransaction.builder()
                .userId(userId)
                .points(points)
                .reason(reason)
                .description(description)
                .build();
        pointTransactionRepository.save(tx);

        // 4. Cập nhật Redis Leaderboard
        leaderboardService.updateScore(userId, points);

        // 5. Kiểm tra lên level
        levelUpService.checkAndLevelUp(memberPoints, newTotal);

        log.info("[Gamification] ✅ userId={} | {} điểm | reason={} | tổng={}", userId, points, reason, newTotal);
    }
}
