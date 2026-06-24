package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);
    boolean existsByUserIdAndBadgeName(Long userId, String badgeName);
    // Đếm badge theo condition để kiểm tra điều kiện trong BadgeEvaluator
    boolean existsByUserIdAndBadge_Condition(Long userId, String condition);
    long countByUserId(Long userId);
}
