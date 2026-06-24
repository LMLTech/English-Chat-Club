package com.ecc.community.application.service;

import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.PointTransaction;
import com.ecc.community.domain.model.UserBadge;
import com.ecc.community.application.port.in.GamificationUseCase;
import com.ecc.community.infrastructure.repository.MemberPointsRepository;
import com.ecc.community.infrastructure.repository.PointTransactionRepository;
import com.ecc.community.infrastructure.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implements GamificationUseCase – phục vụ các API GET cho user.
 */
@Service
@RequiredArgsConstructor
public class GamificationService implements GamificationUseCase {

    private final MemberPointsRepository memberPointsRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final UserBadgeRepository userBadgeRepository;

    @Override
    @Transactional(readOnly = true)
    public MemberPoints getMyPoints(Long userId) {
        return memberPointsRepository.findByUserId(userId)
                .orElseGet(() -> MemberPoints.builder()
                        .userId(userId)
                        .totalPoints(0)
                        .currentLevel(1)
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PointTransaction> getMyTransactions(Long userId) {
        return pointTransactionRepository.findByUserIdOrderByOccurredAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserBadge> getMyBadges(Long userId) {
        return userBadgeRepository.findByUserId(userId);
    }
}
