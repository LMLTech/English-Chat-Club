package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.community.api.dto.request.ForumPostRequest;
import com.ecc.community.api.dto.response.ForumPostResponse;
import com.ecc.community.application.service.ForumInteractionService;
import com.ecc.community.application.service.ForumPostService;
import com.ecc.community.domain.model.ForumPost;
import com.ecc.community.domain.model.SavedPost;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forum/posts")
@RequiredArgsConstructor
public class ForumPostController {

    private final ForumPostService postService;
    private final ForumInteractionService interactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ForumPostResponse>>> getPosts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        Long userId = null;
        if (authentication != null && !"anonymousUser".equals(authentication.getName())) {
            userId = Long.parseLong(authentication.getName());
        }
        Long finalUserId = userId;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostResponse> posts = postService.getPublishedPosts(categoryId, pageable)
                .map(post -> {
                    ForumPostResponse response = ForumPostResponse.fromEntity(post);
                    if (finalUserId != null) {
                        response.setLiked(interactionService.isLiked(finalUserId, post.getId()));
                        response.setSaved(interactionService.isSaved(finalUserId, post.getId()));
                    }
                    return response;
                });
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ForumPostResponse>> getPost(
            @PathVariable Long id,
            Authentication authentication
    ) {
        ForumPost post = postService.viewPost(id);
        ForumPostResponse response = ForumPostResponse.fromEntity(post);
        if (authentication != null && !"anonymousUser".equals(authentication.getName())) {
            Long userId = Long.parseLong(authentication.getName());
            response.setLiked(interactionService.isLiked(userId, post.getId()));
            response.setSaved(interactionService.isSaved(userId, post.getId()));
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<ForumPostResponse>> createPost(
            Authentication authentication,
            @Valid @RequestBody ForumPostRequest request
    ) {
        Long authorId = Long.parseLong(authentication.getName());
        ForumPost post = postService.createPost(
                authorId,
                request.getCategoryId(),
                request.getTitle(),
                request.getContent(),
                request.isRequireApproval()
        );
        return ResponseEntity.ok(ApiResponse.success(ForumPostResponse.fromEntity(post)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<ForumPostResponse>> updatePost(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ForumPostRequest request
    ) {
        Long authorId = Long.parseLong(authentication.getName());
        ForumPost post = postService.updatePost(authorId, id, request.getTitle(), request.getContent());
        return ResponseEntity.ok(ApiResponse.success(ForumPostResponse.fromEntity(post)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deletePost(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long authorId = Long.parseLong(authentication.getName());
        postService.deletePost(authorId, id);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá bài viết thành công"));
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> toggleLike(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = Long.parseLong(authentication.getName());
        boolean isLiked = interactionService.toggleLike(userId, id);
        return ResponseEntity.ok(ApiResponse.success(isLiked ? "Đã like bài viết" : "Đã bỏ like bài viết"));
    }

    @PostMapping("/{id}/save")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> toggleSave(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = Long.parseLong(authentication.getName());
        boolean isSaved = interactionService.toggleSave(userId, id);
        return ResponseEntity.ok(ApiResponse.success(isSaved ? "Đã lưu bài viết" : "Đã bỏ lưu bài viết"));
    }

    @GetMapping("/saved")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ForumPostResponse>>> getSavedPosts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = Long.parseLong(authentication.getName());
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ForumPostResponse> posts = interactionService.getSavedPosts(userId, pageable)
                .map(SavedPost::getPost)
                .map(ForumPostResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }
}
