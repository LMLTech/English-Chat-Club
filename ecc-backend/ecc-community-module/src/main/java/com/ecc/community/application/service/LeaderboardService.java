package com.ecc.community.application.service;

import com.ecc.community.api.dto.response.LeaderboardEntryResponse;
import com.ecc.community.application.port.in.LeaderboardUseCase;
import com.ecc.community.application.port.out.LevelConfigPort;
import com.ecc.community.application.port.out.MemberPointsPort;
import com.ecc.community.domain.model.LevelConfig;
import com.ecc.community.domain.model.MemberPoints;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Service quản lý Leaderboard dùng Redis Sorted Set.
 *
 * Key convention:
 *   leaderboard:weekly   → reset mỗi thứ Hai 00:00
 *   leaderboard:monthly  → reset mỗi ngày 1 của tháng
 *
 * Score = tổng điểm tích lũy trong kỳ.
 * Member = userId.toString()
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardService implements LeaderboardUseCase {

    private static final String KEY_WEEKLY  = "leaderboard:weekly";
    private static final String KEY_MONTHLY = "leaderboard:monthly";

    private final RedisTemplate<String, Object> redisTemplate;
    private final MemberPointsPort memberPointsPort;
    private final LevelConfigPort levelConfigPort;

    // ─────────────────────────────────────────────────────────────────────────
    // Cập nhật điểm
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Cộng điểm vào leaderboard weekly và monthly.
     * Gọi sau mỗi lần cộng điểm thành công.
     */
    public void updateScore(Long userId, int delta) {
        String member = userId.toString();
        try {
            redisTemplate.opsForZSet().incrementScore(KEY_WEEKLY, member, delta);
            redisTemplate.opsForZSet().incrementScore(KEY_MONTHLY, member, delta);
            setTtlIfAbsent(KEY_WEEKLY, secondsUntilNextMonday());
            setTtlIfAbsent(KEY_MONTHLY, secondsUntilNextMonth());
        } catch (Exception e) {
            // Không để Redis lỗi ảnh hưởng business logic chính
            log.error("[Leaderboard] Lỗi cập nhật Redis cho userId={}: {}", userId, e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Đọc leaderboard
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lấy top N từ leaderboard (điểm cao nhất trước).
     *
     * @param type "weekly" hoặc "monthly"
     * @param top  Số lượng trả về (tối đa 100)
     */
    public List<LeaderboardEntryResponse> getTopLeaderboard(String type, int top) {
        List<java.util.Map<String, Object>> topMembers = memberPointsPort.findTopMembersWithUserDetails(top);
        List<LeaderboardEntryResponse> result = new ArrayList<>();
        int rank = 1;
        for (java.util.Map<String, Object> map : topMembers) {
            Long userId = ((Number) map.get("userId")).longValue();
            Long score = ((Number) map.get("totalPoints")).longValue();
            Integer currentLevel = ((Number) map.get("currentLevel")).intValue();
            String username = (String) map.get("username");
            String avatarUrl = (String) map.get("avatarUrl");

            String levelTitle = levelConfigPort.findById(currentLevel)
                .map(LevelConfig::getTitle)
                .orElse("Level " + currentLevel);

            result.add(LeaderboardEntryResponse.builder()
                    .rank(rank++)
                    .userId(userId)
                    .username(username)
                    .avatarUrl(avatarUrl)
                    .score(score)
                    .levelTitle(levelTitle)
                    .build());
        }
        return result;
    }

    /**
     * Lấy leaderboard lọc chỉ trong danh sách bạn bè của user.
     */
    public List<LeaderboardEntryResponse> getFriendsLeaderboard(Long userId, List<Long> friendIds, String type) {
        String key = resolveKey(type);
        List<LeaderboardEntryResponse> all = getTopLeaderboard(type, 10000);

        // Tạo set chứa userId của bạn bè + bản thân
        Set<Long> friendSet = new java.util.HashSet<>(friendIds);
        friendSet.add(userId);

        List<LeaderboardEntryResponse> result = new ArrayList<>();
        int rank = 1;
        for (LeaderboardEntryResponse entry : all) {
            if (friendSet.contains(entry.getUserId())) {
                entry.setRank(rank++);
                result.add(entry);
            }
        }
        return result;
    }

    /**
     * Lấy xếp hạng của user trong leaderboard (1-based, nhỏ nhất = hạng 1).
     */
    public Long getMyRank(Long userId, String type) {
        String key = resolveKey(type);
        Long rank = redisTemplate.opsForZSet().reverseRank(key, userId.toString());
        return rank != null ? rank + 1 : null; // Redis rank 0-based → convert sang 1-based
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private String resolveKey(String type) {
        return "monthly".equalsIgnoreCase(type) ? KEY_MONTHLY : KEY_WEEKLY;
    }

    private List<LeaderboardEntryResponse> buildEntries(Set<ZSetOperations.TypedTuple<Object>> tuples) {
        List<LeaderboardEntryResponse> result = new ArrayList<>();
        if (tuples == null) return result;

        int rank = 1;
        for (ZSetOperations.TypedTuple<Object> tuple : tuples) {
            String memberStr = tuple.getValue() != null ? tuple.getValue().toString() : null;
            if (memberStr == null) continue;

            result.add(LeaderboardEntryResponse.builder()
                    .rank(rank++)
                    .userId(Long.parseLong(memberStr))
                    .score(tuple.getScore() != null ? tuple.getScore().longValue() : 0L)
                    .build());
        }
        return result;
    }

    /** Số giây cho đến thứ Hai tuần sau (00:00) – luôn là tương lai */
    private long secondsUntilNextMonday() {
        LocalDate today = LocalDate.now();
        // Tính số ngày còn lại đến thứ Hai tiếp theo (luôn >= 1 ngày)
        int dayOfWeek = today.getDayOfWeek().getValue(); // Mon=1 ... Sun=7
        int daysUntilMonday = (8 - dayOfWeek) % 7; // Mon→7, Tue→6 ... Sun→1
        if (daysUntilMonday == 0) daysUntilMonday = 7; // Nếu hôm nay là Thứ Hai → lấy Thứ Hai tuần sau
        LocalDate nextMonday = today.plusDays(daysUntilMonday);
        return ChronoUnit.SECONDS.between(
                java.time.LocalDateTime.now(),
                nextMonday.atStartOfDay()
        );
    }

    /** Số giây cho đến ngày 1 tháng sau (00:00) */
    private long secondsUntilNextMonth() {
        LocalDate firstOfNextMonth = LocalDate.now().plusMonths(1).withDayOfMonth(1);
        return ChronoUnit.SECONDS.between(
                java.time.LocalDateTime.now(),
                firstOfNextMonth.atStartOfDay()
        );
    }

    /** Đặt TTL chỉ khi key chưa có TTL (để không reset TTL mỗi lần update) */
    private void setTtlIfAbsent(String key, long seconds) {
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        if (ttl != null && ttl < 0) { // -1 = no expire, -2 = not exist
            redisTemplate.expire(key, seconds, TimeUnit.SECONDS);
        }
    }
}
