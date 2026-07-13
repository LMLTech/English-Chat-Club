package com.ecc.community.api.dto.response;

import com.ecc.community.domain.model.ForumPost;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ForumPostResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Long authorId;
    private String title;
    private String content;
    private String status;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private boolean isLiked;
    private boolean isSaved;

    public static ForumPostResponse fromEntity(ForumPost post) {
        return ForumPostResponse.builder()
                .id(post.getId())
                .categoryId(post.getCategory().getId())
                .categoryName(post.getCategory().getName())
                .authorId(post.getAuthorId())
                .title(post.getTitle())
                .content(post.getContent())
                .status(post.getStatus().name())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
