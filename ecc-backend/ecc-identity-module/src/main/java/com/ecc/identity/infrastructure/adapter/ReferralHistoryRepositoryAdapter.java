package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.ReferralHistoryRepositoryPort;
import com.ecc.identity.domain.model.ReferralHistory;
import com.ecc.identity.infrastructure.repository.ReferralHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReferralHistoryRepositoryAdapter implements ReferralHistoryRepositoryPort {

    private final ReferralHistoryRepository repository;

    @Override
    public ReferralHistory save(ReferralHistory referralHistory) {
        return repository.save(referralHistory);
    }
}
