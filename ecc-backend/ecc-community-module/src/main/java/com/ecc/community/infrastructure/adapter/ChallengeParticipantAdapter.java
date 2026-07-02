package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.ChallengeParticipantPort;
import com.ecc.community.domain.model.ChallengeParticipant;
import com.ecc.community.infrastructure.repository.ChallengeParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ChallengeParticipantAdapter implements ChallengeParticipantPort {

    private final ChallengeParticipantRepository repository;

    @Override
    public ChallengeParticipant save(ChallengeParticipant participant) {
        return repository.save(participant);
    }

    @Override
    public boolean existsByChallengeIdAndUserId(Long challengeId, Long userId) {
        return repository.existsByChallengeIdAndUserId(challengeId, userId);
    }

    @Override
    public List<ChallengeParticipant> findByStatus(String status) {
        return repository.findByStatus(status);
    }

    @Override
    public void saveAll(List<ChallengeParticipant> participants) {
        repository.saveAll(participants);
    }
}