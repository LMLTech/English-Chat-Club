package com.ecc.community.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RewardItemResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Integer pointsCost;
    private String type; // VIRTUAL, PHYSICAL
    private Integer stockQuantity;
    private Boolean isAvailable; // true nếu còn hàng và đang active
}