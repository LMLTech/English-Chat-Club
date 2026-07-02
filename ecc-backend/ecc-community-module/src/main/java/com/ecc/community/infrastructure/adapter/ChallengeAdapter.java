package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.ChallengePort;
import com.ecc.community.domain.model.Challenge;
import com.ecc.community.infrastructure.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ChallengeAdapter implements ChallengePort {

    private final ChallengeRepository repository;

    @Override
    public Challenge save(Challenge challenge) {
        return repository.save(challenge);
    }

    @Override
    public Optional<Challenge> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Page<Challenge> findActiveChallenges(LocalDate date, Pageable pageable) {
        return repository.findActiveChallenges(date, pageable);
    }
}