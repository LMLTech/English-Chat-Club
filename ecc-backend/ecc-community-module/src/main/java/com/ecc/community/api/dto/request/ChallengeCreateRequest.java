package com.ecc.community.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ChallengeCreateRequest {
    @NotBlank
    private String title;
    private String description;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
    @NotBlank
    private String conditionExpression;
    @NotNull
    private Integer rewardPoints;
    private Long rewardBadgeId;
}