package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.MemberPointsPort;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.infrastructure.repository.MemberPointsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MemberPointsRepositoryAdapter implements MemberPointsPort {

    private final MemberPointsRepository repository;

    @Override
    public Optional<MemberPoints> findByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public MemberPoints save(MemberPoints memberPoints) {
        return repository.save(memberPoints);
    }
}