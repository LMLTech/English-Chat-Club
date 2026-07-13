package com.ecc.community.api.dto.response;

import lombok.*;

/**
 * DTO trả về một entry trong bảng xếp hạng.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntryResponse {
    private int rank;
    private Long userId;
    private String username;
    private String avatarUrl;
    private Long score;
    private String levelTitle;
}
