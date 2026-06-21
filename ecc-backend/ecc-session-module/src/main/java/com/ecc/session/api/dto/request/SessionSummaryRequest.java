package com.ecc.session.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SessionSummaryRequest {
    @NotBlank(message = "content is required")
    private String content;
}
