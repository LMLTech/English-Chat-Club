package com.ecc.content.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.content.api.dto.request.LearningResourceRequest;
import com.ecc.content.api.dto.response.LearningResourceResponse;
import com.ecc.content.application.port.in.LearningResourceUseCase;
import com.ecc.content.domain.model.LearningResource;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content/resources")
@RequiredArgsConstructor
public class LearningResourceController {

    private final LearningResourceUseCase resourceUseCase;

    // 1. Admin đăng tài nguyên
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<LearningResourceResponse>> createResource(
            Authentication authentication,
            @Valid @RequestBody LearningResourceRequest request) {
        Long adminId = Long.parseLong(authentication.getName());
        LearningResource resource = resourceUseCase.createResource(adminId, request);
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(resource)));
    }

    // 2. Admin sửa tài nguyên
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<LearningResourceResponse>> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody LearningResourceRequest request) {
        LearningResource resource = resourceUseCase.updateResource(id, request);
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(resource)));
    }

    // 3. Admin xóa (soft-delete)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteResource(@PathVariable Long id) {
        resourceUseCase.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa tài nguyên thành công"));
    }

    // 4. Mọi User lấy danh sách tài nguyên (Có thể lọc theo category)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<LearningResourceResponse>>> getResources(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // Mặc định sắp xếp mới nhất lên đầu
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<LearningResourceResponse> resources = resourceUseCase.getActiveResources(category, pageRequest)
                .map(this::mapToResponse);

        return ResponseEntity.ok(ApiResponse.success(resources));
    }
    // 5. Lấy chi tiết 1 tài nguyên
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LearningResourceResponse>> getResourceById(@PathVariable Long id) {
        LearningResource resource = resourceUseCase.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(resource)));
    }

    // Mapper nội bộ
    private LearningResourceResponse mapToResponse(LearningResource resource) {
        return LearningResourceResponse.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .type(resource.getType())
                .url(resource.getUrl())
                .category(resource.getCategory())
                .imageUrl(resource.getImageUrl())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}