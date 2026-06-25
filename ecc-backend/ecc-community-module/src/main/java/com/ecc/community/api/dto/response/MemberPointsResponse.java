package com.ecc.community.api.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberPointsResponse {
    private Long userId;
    private Integer totalPoints;
    private Integer currentLevel;
    private String levelTitle;   // Lấy từ LevelConfig (được join trong service)
    private LocalDateTime updatedAt;
}
