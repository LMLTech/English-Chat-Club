package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.LevelConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LevelConfigRepository extends JpaRepository<LevelConfig, Integer> {

    /**
     * Tìm level cao nhất mà user đủ điều kiện.
     * Ví dụ: user có 350 điểm → trả về level 3 (yêu cầu 300 điểm).
     */
    Optional<LevelConfig> findTopByRequiredPointsLessThanEqualOrderByRequiredPointsDesc(Integer points);
}
