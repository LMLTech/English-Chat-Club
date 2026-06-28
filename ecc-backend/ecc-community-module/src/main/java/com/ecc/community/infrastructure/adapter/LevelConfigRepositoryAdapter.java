package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.LevelConfigPort;
import com.ecc.community.domain.model.LevelConfig;
import com.ecc.community.infrastructure.repository.LevelConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class LevelConfigRepositoryAdapter implements LevelConfigPort {

    private final LevelConfigRepository repository;

    @Override
    public Optional<LevelConfig> findTopByRequiredPointsLessThanEqualOrderByRequiredPointsDesc(Integer points) {
        return repository.findTopByRequiredPointsLessThanEqualOrderByRequiredPointsDesc(points);
    }

    @Override
    public Optional<LevelConfig> findById(Integer level) {
        return repository.findById(level);
    }
}