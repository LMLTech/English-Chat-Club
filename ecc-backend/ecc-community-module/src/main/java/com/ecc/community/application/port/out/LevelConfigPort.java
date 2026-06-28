package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.LevelConfig;
import java.util.Optional;

public interface LevelConfigPort {
    Optional<LevelConfig> findTopByRequiredPointsLessThanEqualOrderByRequiredPointsDesc(Integer points);
    Optional<LevelConfig> findById(Integer level);
}