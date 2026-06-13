package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.TokenCachePort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component // Adapter thao tác với Redis
@RequiredArgsConstructor
public class TokenCacheAdapter implements TokenCachePort {

    // Redis Template dùng để đọc/ghi dữ liệu Redis
    private final StringRedisTemplate redisTemplate;

    @Override
    public void saveTemp2faToken(Long userId, String token, long durationInMinutes) {

        // Key: temp:2fa:{userId}
        String key = "temp:2fa:" + userId;

        // Lưu temp token vào Redis với thời gian sống (TTL)
        redisTemplate.opsForValue()
                .set(key, token, durationInMinutes, TimeUnit.MINUTES);
    }

    @Override
    public void saveRefreshToken(Long userId, String tokenId, long durationInMinutes) {

        // Key: refresh:{userId}:{tokenId}
        String key = "refresh:" + userId + ":" + tokenId;

        // Lưu Refresh Token vào Redis với TTL
        redisTemplate.opsForValue()
                .set(key, "VALID", durationInMinutes, TimeUnit.MINUTES);
    }
}