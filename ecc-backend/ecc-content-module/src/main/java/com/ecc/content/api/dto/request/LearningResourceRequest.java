package com.ecc.content.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LearningResourceRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Loại tài nguyên không được để trống")
    @Pattern(regexp = "^(VIDEO|PDF|LINK|OTHER)$", message = "Loại tài nguyên phải là VIDEO, PDF, LINK hoặc OTHER")
    private String type;

    @NotBlank(message = "URL không được để trống")
    private String url;

    private String category;
    private String imageUrl;
}