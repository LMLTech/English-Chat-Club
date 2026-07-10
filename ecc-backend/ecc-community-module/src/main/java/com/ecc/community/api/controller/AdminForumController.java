package com.ecc.community.api.controller;

import com.ecc.common.audit.Auditable;
import com.ecc.common.dto.ApiResponse;
import com.ecc.community.api.dto.response.ForumCommentResponse;
import com.ecc.community.api.dto.response.ForumPostResponse;
import com.ecc.community.application.service.AdminForumModerationService;
import com.ecc.community.domain.model.ForumComment;
import com.ecc.community.domain.model.ForumPost;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/forum")
@RequiredArgsConstructor
public class AdminForumController {

    private final AdminForumModerationService moderationService;

    @GetMapping("/posts/pending")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MODERATOR')")
    public ResponseEntity<ApiResponse<Page<ForumPostResponse>>> getPendingPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<ForumPostResponse> posts = moderationService.getPendingPosts(pageable)
                .map(ForumPostResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @PostMapping("/posts/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MODERATOR')")
    @Auditable(action = "APPROVE_POST", description = "Duyệt bài viết forum")
    public ResponseEntity<ApiResponse<ForumPostResponse>> approvePost(
            @PathVariable Long id
    ) {
        ForumPost post = moderationService.approvePost(id);
        return ResponseEntity.ok(ApiResponse.success(ForumPostResponse.fromEntity(post)));
    }

    @PostMapping("/posts/{id}/hide")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MODERATOR')")
    @Auditable(action = "HIDE_POST", description = "Ẩn bài viết forum")
    public ResponseEntity<ApiResponse<ForumPostResponse>> hidePost(
            @PathVariable Long id,
            @RequestParam String reason
    ) {
        ForumPost post = moderationService.hidePost(id, reason);
        return ResponseEntity.ok(ApiResponse.success(ForumPostResponse.fromEntity(post)));
    }

    @PostMapping("/comments/{id}/hide")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MODERATOR')")
    @Auditable(action = "HIDE_COMMENT", description = "Ẩn bình luận forum")
    public ResponseEntity<ApiResponse<ForumCommentResponse>> hideComment(
            @PathVariable Long id,
            @RequestParam String reason
    ) {
        ForumComment comment = moderationService.hideComment(id, reason);
        return ResponseEntity.ok(ApiResponse.success(ForumCommentResponse.fromEntity(comment)));
    }
}
