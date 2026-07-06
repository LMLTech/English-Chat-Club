package com.ecc.content.infrastructure.adapter;

import com.ecc.content.application.port.out.LearningResourcePort;
import com.ecc.content.domain.model.LearningResource;
import com.ecc.content.infrastructure.repository.LearningResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class LearningResourceAdapter implements LearningResourcePort {

    private final LearningResourceRepository repository;

    @Override
    public LearningResource save(LearningResource resource) {
        return repository.save(resource);
    }

    @Override
    public Optional<LearningResource> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Page<LearningResource> findActiveResources(Pageable pageable) {
        return repository.findByIsActiveTrueAndDeletedAtIsNull(pageable);
    }

    @Override
    public Page<LearningResource> findActiveResourcesByCategory(String category, Pageable pageable) {
        return repository.findByIsActiveTrueAndDeletedAtIsNullAndCategory(category, pageable);
    }
}