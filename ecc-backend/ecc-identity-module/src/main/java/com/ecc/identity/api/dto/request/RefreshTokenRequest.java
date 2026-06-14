package com.ecc.identity.api.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class RefreshTokenRequest {
    // Access token cũ truyền lên để đưa vào blacklist (Tùy chọn)
    private String accessToken;

    @NotBlank(message = "Refresh token không được để trống")
    private String refreshToken;
}
