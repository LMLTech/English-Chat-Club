package com.ecc.content.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EmailCampaignRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Chủ đề email không được để trống")
    private String subject;

    @NotBlank(message = "Nội dung email không được để trống")
    private String htmlContent;

    // Ví dụ: {"level": "B1", "inactiveDays": 30}
    private String targetSegment;

    private LocalDateTime scheduledAt;
}