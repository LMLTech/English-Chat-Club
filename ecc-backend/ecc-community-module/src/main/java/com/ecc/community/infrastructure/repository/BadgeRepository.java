package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Optional<Badge> findByCondition(String condition);
    boolean existsByCondition(String condition);
}
