package com.ecc.community.api.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeResponse {
    private Long badgeId;
    private String name;
    private String description;
    private String iconUrl;
    private String condition;
    private LocalDateTime awardedAt;
}
