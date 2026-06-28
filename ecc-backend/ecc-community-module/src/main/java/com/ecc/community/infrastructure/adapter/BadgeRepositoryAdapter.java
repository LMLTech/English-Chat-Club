package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.BadgePort;
import com.ecc.community.domain.model.Badge;
import com.ecc.community.infrastructure.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BadgeRepositoryAdapter implements BadgePort {

    private final BadgeRepository repository;

    @Override
    public Optional<Badge> findByCondition(String condition) {
        return repository.findByCondition(condition);
    }

    @Override
    public boolean existsByCondition(String condition) {
        return repository.existsByCondition(condition);
    }
}