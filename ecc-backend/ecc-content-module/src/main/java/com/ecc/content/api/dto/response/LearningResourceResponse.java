package com.ecc.content.api.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class LearningResourceResponse {
    private Long id;
    private String title;
    private String type;
    private String url;
    private String category;
    private LocalDateTime createdAt;
}