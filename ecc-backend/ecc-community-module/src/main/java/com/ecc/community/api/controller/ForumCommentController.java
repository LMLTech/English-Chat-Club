package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.community.api.dto.request.forum.ForumCommentRequest;
import com.ecc.community.api.dto.response.forum.ForumCommentResponse;
import com.ecc.community.application.service.ForumCommentService;
import com.ecc.community.domain.model.forum.ForumComment;
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

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumCommentController {

    private final ForumCommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<Page<ForumCommentResponse>>> getRootComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<ForumCommentResponse> comments = commentService.getRootComments(postId, pageable)
                .map(ForumCommentResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<ApiResponse<List<ForumCommentResponse>>> getReplies(
            @PathVariable Long commentId
    ) {
        List<ForumCommentResponse> replies = commentService.getReplies(commentId)
                .stream()
                .map(ForumCommentResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(replies));
    }

    @PostMapping("/posts/{postId}/comments")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<ForumCommentResponse>> addComment(
            Authentication authentication,
            @PathVariable Long postId,
            @Valid @RequestBody ForumCommentRequest request
    ) {
        Long authorId = Long.parseLong(authentication.getName());
        ForumComment comment = commentService.createRootComment(authorId, postId, request.getContent());
        return ResponseEntity.ok(ApiResponse.success(ForumCommentResponse.fromEntity(comment)));
    }

    @PostMapping("/comments/{commentId}/replies")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<ForumCommentResponse>> addReply(
            Authentication authentication,
            @PathVariable Long commentId,
            @Valid @RequestBody ForumCommentRequest request
    ) {
        Long authorId = Long.parseLong(authentication.getName());
        ForumComment reply = commentService.createReply(authorId, commentId, request.getContent());
        return ResponseEntity.ok(ApiResponse.success(ForumCommentResponse.fromEntity(reply)));
    }

    @DeleteMapping("/comments/{id}")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteComment(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long authorId = Long.parseLong(authentication.getName());
        commentService.deleteComment(authorId, id);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá bình luận"));
    }
}
