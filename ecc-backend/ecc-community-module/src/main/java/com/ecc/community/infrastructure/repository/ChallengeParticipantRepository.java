package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.ChallengeParticipant;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeParticipantRepository extends JpaRepository<ChallengeParticipant, Long> {
    boolean existsByChallengeIdAndUserId(Long challengeId, Long userId);

    // Lấy tất cả người đang tham gia để Job chạy đánh giá (Chống N+1 bằng EntityGraph)
    @EntityGraph(attributePaths = {"challenge"})
    List<ChallengeParticipant> findByStatus(String status);
}