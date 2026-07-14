package com.ecc.session.api.dto.response;

import com.ecc.session.domain.model.SessionReview;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long sessionId;
    private String sessionTitle;
    private Long reviewerId;
    private String userName;
    private Integer moderatorRating;
    private Integer topicRating;
    private Integer rating; // Trung bình cộng hoặc chỉ dùng moderatorRating
    private String comment;
    private java.time.LocalDateTime createdAt;

    public static ReviewResponse fromEntity(SessionReview review, String sessionTitle, String userName) {
        return ReviewResponse.builder()
                .id(review.getId())
                .sessionId(review.getSessionId())
                .sessionTitle(sessionTitle)
                .reviewerId(review.getReviewerId())
                .userName(userName)
                .moderatorRating(review.getModeratorRating())
                .topicRating(review.getTopicRating())
                .rating((review.getModeratorRating() + review.getTopicRating()) / 2)
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
