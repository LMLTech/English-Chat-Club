package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.TokenCachePort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class TokenCacheAdapter implements TokenCachePort {
    private final StringRedisTemplate redisTemplate;

    @Override
    public void saveTemp2faToken(String tempToken, Long userId, long durationInMinutes) {
        String key = "temp:2fa:" + tempToken; // Khóa dùng chính token để tìm kiếm lẹ hơn
        redisTemplate.opsForValue().set(key, userId.toString(), durationInMinutes, TimeUnit.MINUTES);
    }

    @Override
    public Long getUserIdByTemp2faToken(String tempToken) {
        String key = "temp:2fa:" + tempToken;
        String val = redisTemplate.opsForValue().get(key);
        return val != null ? Long.parseLong(val) : null;
    }

    @Override
    public void saveRefreshToken(Long userId, String tokenId, long durationInMinutes) {
        String key = "refresh:" + userId + ":" + tokenId;
        redisTemplate.opsForValue().set(key, "VALID", durationInMinutes, java.util.concurrent.TimeUnit.MINUTES);
    }

    @Override
    public void deleteRefreshToken(Long userId, String tokenId) {
        String key = "refresh:" + userId + ":" + tokenId;
        redisTemplate.delete(key);
    }

    @Override
    public void addToBlacklist(String jti, long expireSeconds) {
        String key = "blacklist:access:" + jti;
        redisTemplate.opsForValue().set(key, "REVOKED", expireSeconds, TimeUnit.SECONDS);
    }

    @Override
    public boolean isBlacklisted(String jti) {
        String key = "blacklist:access:" + jti;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}