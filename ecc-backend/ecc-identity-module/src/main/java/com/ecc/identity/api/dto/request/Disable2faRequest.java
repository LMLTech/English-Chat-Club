package com.ecc.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class Disable2faRequest {
    @NotBlank(message = "Vui lòng nhập mã TOTP để xác nhận tắt bảo mật 2 lớp")
    private String totpCode;
}