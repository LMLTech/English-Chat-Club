package com.ecc.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    private String bio;

    // Validate có thể làm chặt hơn ở mức độ Custom Validator (chỉ nhận A1, A2, B1, B2, C1, C2)
    private String cefrLevel;

    private String learningGoal;

    private String avatarUrl;
}