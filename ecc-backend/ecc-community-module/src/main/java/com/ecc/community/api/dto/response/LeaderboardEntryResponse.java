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
    private Long score;
    // Các field thêm có thể populate từ user-service: displayName, avatarUrl
    // Hiện tại chỉ trả userId và score để tránh cross-module query
}
