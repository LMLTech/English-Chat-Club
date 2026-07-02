package com.ecc.community.api.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class ChallengeResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String conditionExpression;
    private Integer rewardPoints;
    private Long rewardBadgeId;
    private boolean isActive;
}