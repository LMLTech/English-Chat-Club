package com.ecc.community.api.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointTransactionResponse {
    private Long id;
    private Integer points;
    private String reason;
    private String description;
    private LocalDateTime occurredAt;
}
