package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.community.api.dto.response.LeaderboardEntryResponse;
import com.ecc.community.application.port.in.LeaderboardUseCase;
import com.ecc.community.application.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller Leaderboard.
 * Hỗ trợ lọc theo type (weekly/monthly) và top N.
 */
@RestController
@RequestMapping("/api/community/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardUseCase leaderboardUseCase;

    /**
     * GET /api/community/leaderboard?type=weekly&top=100
     * Trả về top N user theo điểm trong kỳ.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getTopLeaderboard(
            @RequestParam(defaultValue = "weekly") String type,
            @RequestParam(defaultValue = "100") int top) {

        // Giới hạn tối đa 100 để tránh lạm dụng
        int limit = Math.min(top, 100);
        List<LeaderboardEntryResponse> result = leaderboardUseCase.getTopLeaderboard(type, limit);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/community/leaderboard/rank?type=weekly
     * Lấy xếp hạng của user hiện tại trong leaderboard.
     */
    @GetMapping("/rank")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getMyRank(
            @RequestParam(defaultValue = "weekly") String type,
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());
        Long rank = leaderboardUseCase.getMyRank(userId, type);
        return ResponseEntity.ok(ApiResponse.success(rank));
    }

    /**
     * GET /api/community/leaderboard/friends?type=weekly&friendIds=1,2,3
     * Lọc leaderboard theo danh sách bạn bè.
     * friendIds là comma-separated list.
     */
    @GetMapping("/friends")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getFriendsLeaderboard(
            @RequestParam(defaultValue = "weekly") String type,
            @RequestParam List<Long> friendIds,
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());
        List<LeaderboardEntryResponse> result = leaderboardUseCase.getFriendsLeaderboard(userId, friendIds, type);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
