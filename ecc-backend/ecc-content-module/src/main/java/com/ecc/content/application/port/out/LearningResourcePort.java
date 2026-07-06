package com.ecc.content.application.port.out;

import com.ecc.content.domain.model.LearningResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface LearningResourcePort {
    LearningResource save(LearningResource resource);
    Optional<LearningResource> findById(Long id);
    Page<LearningResource> findActiveResources(Pageable pageable);
    Page<LearningResource> findActiveResourcesByCategory(String category, Pageable pageable);
}