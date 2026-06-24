package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.MemberPoints;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberPointsRepository extends JpaRepository<MemberPoints, Long> {
    Optional<MemberPoints> findByUserId(Long userId);
}
