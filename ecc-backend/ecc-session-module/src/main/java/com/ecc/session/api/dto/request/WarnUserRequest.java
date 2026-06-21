package com.ecc.session.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WarnUserRequest {
    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "sessionId is required")
    private Long sessionId;

    @NotBlank(message = "reason is required")
    private String reason;
}
