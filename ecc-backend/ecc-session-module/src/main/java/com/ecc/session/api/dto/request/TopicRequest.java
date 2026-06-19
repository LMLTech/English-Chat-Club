package com.ecc.session.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TopicRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    private String description;
    private String imageUrl;
}