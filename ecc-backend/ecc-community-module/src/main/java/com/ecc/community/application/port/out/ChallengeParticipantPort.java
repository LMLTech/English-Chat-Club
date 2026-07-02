package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.ChallengeParticipant;
import java.util.List;

public interface ChallengeParticipantPort {
    ChallengeParticipant save(ChallengeParticipant participant);
    boolean existsByChallengeIdAndUserId(Long challengeId, Long userId);
    List<ChallengeParticipant> findByStatus(String status);
    void saveAll(List<ChallengeParticipant> participants);
}