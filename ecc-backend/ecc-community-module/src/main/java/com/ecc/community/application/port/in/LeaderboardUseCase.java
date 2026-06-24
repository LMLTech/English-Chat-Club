package com.ecc.community.application.port.in;

import com.ecc.community.api.dto.response.LeaderboardEntryResponse;

import java.util.List;

/**
 * Inbound port: các use case leaderboard mà Controller sẽ gọi.
 */
public interface LeaderboardUseCase {

    /**
     * Lấy top N leaderboard.
     *
     * @param type "weekly" hoặc "monthly"
     * @param top  Số lượng user trả về (mặc định 100)
     */
    List<LeaderboardEntryResponse> getTopLeaderboard(String type, int top);

    /**
     * Lấy leaderboard lọc theo danh sách bạn bè.
     *
     * @param userId    User đang xem
     * @param friendIds Danh sách userId của bạn bè
     * @param type      "weekly" hoặc "monthly"
     */
    List<LeaderboardEntryResponse> getFriendsLeaderboard(Long userId, List<Long> friendIds, String type);

    /**
     * Lấy xếp hạng của user trong leaderboard.
     */
    Long getMyRank(Long userId, String type);
}
