package com.ecc.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class Disable2faRequest {
    @NotBlank(message = "Vui lòng nhập mật khẩu để xác nhận tắt bảo mật 2 lớp")
    private String password;
}