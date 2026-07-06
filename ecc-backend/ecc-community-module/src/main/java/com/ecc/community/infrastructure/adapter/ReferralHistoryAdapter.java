package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.ReferralHistoryPort;
import com.ecc.community.domain.model.ReferralHistory;
import com.ecc.community.infrastructure.repository.ReferralHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ReferralHistoryAdapter implements ReferralHistoryPort {
    private final ReferralHistoryRepository repository;

    @Override
    public Optional<ReferralHistory> findPendingReferralByReferredUserId(Long referredUserId) {
        // Tìm lịch sử của user này mà status KHÔNG PHẢI là REWARDED
        return repository.findByReferredUserIdAndStatusNot(referredUserId, "REWARDED");
    }

    @Override
    public ReferralHistory save(ReferralHistory referralHistory) {
        return repository.save(referralHistory);
    }
}