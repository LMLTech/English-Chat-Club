package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.UserBadgePort;
import com.ecc.community.domain.model.UserBadge;
import com.ecc.community.infrastructure.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class UserBadgeRepositoryAdapter implements UserBadgePort {

    private final UserBadgeRepository repository;

    @Override
    public List<UserBadge> findByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public boolean existsByUserIdAndBadge_Condition(Long userId, String condition) {
        return repository.existsByUserIdAndBadge_Condition(userId, condition);
    }

    @Override
    public UserBadge save(UserBadge userBadge) {
        return repository.save(userBadge);
    }
}