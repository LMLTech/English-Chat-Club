package com.ecc.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupportTicketRequest {

    @NotBlank(message = "Vui lòng nhập tiêu đề")
    private String subject;

    @NotBlank(message = "Vui lòng nhập nội dung")
    private String content;

    @NotBlank(message = "Vui lòng chọn danh mục")
    private String category;
}
