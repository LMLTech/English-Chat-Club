package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.RedemptionOrderPort;
import com.ecc.community.domain.model.RedemptionOrder;
import com.ecc.community.infrastructure.repository.RedemptionOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RedemptionOrderAdapter implements RedemptionOrderPort {
    private final RedemptionOrderRepository repository;

    @Override
    public Optional<RedemptionOrder> findById(Long id) { return repository.findById(id); }

    @Override
    public Page<RedemptionOrder> findByUserId(Long userId, Pageable pageable) { return repository.findByUserIdOrderByOrderedAtDesc(userId, pageable); }

    @Override
    public Page<RedemptionOrder> findAllOrders(Pageable pageable) { return repository.findAll(pageable); }

    @Override
    public RedemptionOrder save(RedemptionOrder order) { return repository.save(order); }
}