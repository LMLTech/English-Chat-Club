package com.ecc.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class Verify2faSetupRequest {
    @NotBlank(message = "Secret key is required")
    // Secret Key sinh ra khi bật 2FA
    private String secretKey;

    @NotBlank(message = "TOTP code is required")
    @Pattern(regexp = "^\\d{6}$", message = "TOTP code must be 6 digits")
    // Mã OTP 6 số từ Google Authenticator
    private String totpCode;
}