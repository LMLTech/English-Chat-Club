package com.ecc.community.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RewardItemRequest {
    @NotBlank(message = "Tên quà không được để trống")
    private String name;

    private String description;
    private String imageUrl;

    @NotNull(message = "Giá điểm không được để trống")
    private Integer pointsCost;

    @NotBlank(message = "Loại quà không được để trống (VIRTUAL, PHYSICAL)")
    private String type;

    private Integer stockQuantity;
    private Boolean isActive = true;
}