package com.ecc.identity.api.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // Ẩn các trường null để JSON gọn gàng
public class AuthResponse {
    private boolean require2fa;
    private String tempToken; // Chỉ trả về nếu require2fa = true
    private String accessToken; // Chỉ trả về nếu require2fa = false
    private String refreshToken; // Chỉ trả về nếu require2fa = false
}