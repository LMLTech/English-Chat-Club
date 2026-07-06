package com.ecc.content.application.service;

import com.ecc.content.api.dto.request.LearningResourceRequest;
import com.ecc.content.application.port.in.LearningResourceUseCase;
import com.ecc.content.application.port.out.LearningResourcePort;
import com.ecc.content.domain.model.LearningResource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LearningResourceService implements LearningResourceUseCase {

    private final LearningResourcePort resourcePort;

    @Override
    @Transactional
    public LearningResource createResource(Long adminId, LearningResourceRequest request) {
        LearningResource resource = LearningResource.builder()
                .title(request.getTitle())
                .type(request.getType())
                .url(request.getUrl())
                .category(request.getCategory())
                .uploadedBy(adminId)
                .build();

        log.info("[Content] Admin {} đã tạo tài nguyên mới: {}", adminId, request.getTitle());
        return resourcePort.save(resource);
    }

    @Override
    @Transactional
    public LearningResource updateResource(Long id, LearningResourceRequest request) {
        LearningResource resource = resourcePort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài nguyên học tập"));

        resource.setTitle(request.getTitle());
        resource.setType(request.getType());
        resource.setUrl(request.getUrl());
        resource.setCategory(request.getCategory());

        log.info("[Content] Tài nguyên {} vừa được cập nhật", id);
        return resourcePort.save(resource);
    }

    @Override
    @Transactional
    public void deleteResource(Long id) {
        LearningResource resource = resourcePort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài nguyên học tập"));

        resource.softDelete();
        resourcePort.save(resource);
        log.info("[Content] Đã xóa mềm tài nguyên {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LearningResource> getActiveResources(String category, Pageable pageable) {
        if (category != null && !category.trim().isEmpty()) {
            return resourcePort.findActiveResourcesByCategory(category, pageable);
        }
        return resourcePort.findActiveResources(pageable);
    }
    @Override
    @Transactional(readOnly = true)
    public LearningResource getResourceById(Long id) {
        return resourcePort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài nguyên học tập"));
    }
}