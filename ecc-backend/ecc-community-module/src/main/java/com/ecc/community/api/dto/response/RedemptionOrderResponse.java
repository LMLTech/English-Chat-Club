package com.ecc.community.api.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class RedemptionOrderResponse {
    private UUID orderId;
    private String itemName;
    private Integer pointsDeducted;
    private String status;
    private String trackingCode;
    private LocalDateTime orderedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
}