package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.RewardItemPort;
import com.ecc.community.domain.model.RewardItem;
import com.ecc.community.infrastructure.repository.RewardItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RewardItemAdapter implements RewardItemPort {
    private final RewardItemRepository repository;

    @Override
    public Optional<RewardItem> findById(Long id) { return repository.findById(id); }

    @Override
    public Page<RewardItem> findActiveItems(Pageable pageable) { return repository.findByIsActiveTrueAndDeletedAtIsNull(pageable); }

    @Override
    public RewardItem save(RewardItem item) { return repository.save(item); }
}