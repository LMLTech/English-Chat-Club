package com.ecc.community.api.dto.response;

import com.ecc.community.domain.model.ForumComment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ForumCommentResponse {
    private Long id;
    private Long postId;
    private Long parentId;
    private Long authorId;
    private String content;
    private String status;
    private int replyCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ForumCommentResponse fromEntity(ForumComment comment) {
        return ForumCommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .authorId(comment.getAuthorId())
                .content(comment.getContent())
                .status(comment.getStatus().name())
                .replyCount(comment.getReplyCount())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
