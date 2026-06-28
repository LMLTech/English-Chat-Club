package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.PointTransactionPort;
import com.ecc.community.domain.model.PointTransaction;
import com.ecc.community.infrastructure.repository.PointTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PointTransactionRepositoryAdapter implements PointTransactionPort {

    private final PointTransactionRepository repository;

    @Override
    public List<PointTransaction> findByUserIdOrderByOccurredAtDesc(Long userId) {
        return repository.findByUserIdOrderByOccurredAtDesc(userId);
    }

    @Override
    public PointTransaction save(PointTransaction transaction) {
        return repository.save(transaction);
    }
}