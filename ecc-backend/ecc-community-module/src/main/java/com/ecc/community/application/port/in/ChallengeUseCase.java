package com.ecc.community.application.port.in;

import com.ecc.community.api.dto.request.ChallengeCreateRequest;
import com.ecc.community.domain.model.Challenge;
import com.ecc.community.domain.model.ChallengeParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChallengeUseCase {
    Challenge createChallenge(Long adminId, ChallengeCreateRequest request);
    Page<Challenge> getActiveChallenges(Pageable pageable);
    ChallengeParticipant joinChallenge(Long userId, Long challengeId);
    void evaluateOngoingChallenges(); // Hàm dành cho Cron Job
}