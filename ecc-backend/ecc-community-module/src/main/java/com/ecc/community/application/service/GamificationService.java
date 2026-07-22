package com.ecc.community.application.service;

import com.ecc.community.application.port.in.GamificationUseCase;
import com.ecc.community.application.port.out.MemberPointsPort;
import com.ecc.community.application.port.out.PointTransactionPort;
import com.ecc.community.application.port.out.UserBadgePort;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.PointTransaction;
import com.ecc.community.domain.model.UserBadge;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GamificationService implements GamificationUseCase {

    private final MemberPointsPort memberPointsPort;
    private final PointTransactionPort pointTransactionPort;
    private final UserBadgePort userBadgePort;
    private final LevelUpService levelUpService;

    @Override
    @Transactional
    public MemberPoints getMyPoints(Long userId) {
        MemberPoints memberPoints = memberPointsPort.findByUserId(userId)
                .orElseGet(() -> memberPointsPort.save(
                        MemberPoints.builder()
                                .userId(userId)
                                .totalPoints(0)
                                .currentLevel(1)
                                .build()
                ));
        // Recalculate level just in case it was out of sync
        levelUpService.checkAndLevelUp(memberPoints, memberPoints.getTotalPoints());
        return memberPoints;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PointTransaction> getMyTransactions(Long userId) {
        return pointTransactionPort.findByUserIdOrderByOccurredAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserBadge> getMyBadges(Long userId) {
        return userBadgePort.findByUserId(userId);
    }
}