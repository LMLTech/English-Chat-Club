package com.ecc.community.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DirectMessageRequest {
    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    private String attachmentUrl;
}
