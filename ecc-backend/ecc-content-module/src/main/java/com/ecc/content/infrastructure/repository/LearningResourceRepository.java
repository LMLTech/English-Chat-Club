package com.ecc.content.infrastructure.repository;

import com.ecc.content.domain.model.LearningResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningResourceRepository extends JpaRepository<LearningResource, Long> {
    Page<LearningResource> findByIsActiveTrueAndDeletedAtIsNull(Pageable pageable);
    Page<LearningResource> findByIsActiveTrueAndDeletedAtIsNullAndCategory(String category, Pageable pageable);
}