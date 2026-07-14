package com.ecc.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupportTicketReplyRequest {

    @NotBlank(message = "Vui lòng nhập nội dung phản hồi")
    private String replyMessage;
}
