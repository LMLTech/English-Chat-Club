package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.community.api.dto.response.forum.ForumCategoryResponse;
import com.ecc.community.infrastructure.repository.ForumCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum/categories")
@RequiredArgsConstructor
public class ForumCategoryController {

    private final ForumCategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ForumCategoryResponse>>> getCategories() {
        List<ForumCategoryResponse> categories = categoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(ForumCategoryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}
