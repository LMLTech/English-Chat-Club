package com.ecc.community.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RedeemRequest {
    @NotNull(message = "ID món quà không được để trống")
    private Long rewardItemId;

    private Long addressId; // Bắt buộc nếu là quà PHYSICAL
}