package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    // Tìm các thử thách đang diễn ra
    @Query("SELECT c FROM Challenge c WHERE c.startDate <= :today AND c.endDate >= :today")
    Page<Challenge> findActiveChallenges(LocalDate today, Pageable pageable);
}