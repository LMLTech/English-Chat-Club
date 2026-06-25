package com.ecc.community.api.dto.request.forum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ForumPostRequest {
    @NotNull(message = "Category ID không được để trống")
    private Long categoryId;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    private boolean requireApproval = false; // Mặc định PUBLISHED, nếu true -> PENDING
}
