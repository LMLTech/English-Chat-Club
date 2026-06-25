package com.ecc.community.api.dto.request.forum;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForumCommentRequest {
    @NotBlank(message = "Nội dung bình luận không được để trống")
    private String content;
}
