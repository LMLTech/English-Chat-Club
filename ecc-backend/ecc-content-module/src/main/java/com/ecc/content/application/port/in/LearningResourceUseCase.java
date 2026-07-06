package com.ecc.content.application.port.in;

import com.ecc.content.api.dto.request.LearningResourceRequest;
import com.ecc.content.domain.model.LearningResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LearningResourceUseCase {
    LearningResource createResource(Long adminId, LearningResourceRequest request);
    LearningResource updateResource(Long id, LearningResourceRequest request);
    void deleteResource(Long id);
    Page<LearningResource> getActiveResources(String category, Pageable pageable);
    LearningResource getResourceById(Long id);
}