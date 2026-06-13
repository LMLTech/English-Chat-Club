package com.ecc.identity.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data // Tự sinh Getter, Setter, toString,...
public class LoginRequest {

    // Email đăng nhập
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    // Mật khẩu đăng nhập
    @NotBlank(message = "Password cannot be blank")
    private String password;
}