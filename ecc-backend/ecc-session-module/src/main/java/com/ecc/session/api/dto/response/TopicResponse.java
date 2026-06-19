package com.ecc.session.api.dto.response;

import com.ecc.session.domain.model.DiscussionTopic;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TopicResponse {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Hàm tiện ích map từ Entity sang DTO
    public static TopicResponse fromEntity(DiscussionTopic topic) {
        return TopicResponse.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .imageUrl(topic.getImageUrl())
                .isActive(topic.getIsActive())
                .createdAt(topic.getCreatedAt())
                .build();
    }
}