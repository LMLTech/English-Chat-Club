package com.ecc.session.infrastructure.adapter;

import com.ecc.session.api.dto.response.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ChatMessageRedisAdapter {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CHAT_ROOM_PREFIX = "chat:room:";
    private static final int MAX_HISTORY_MESSAGES = 50;

    // Lưu tin nhắn vào cuối danh sách Redis
    public void saveMessageToCache(Long sessionId, ChatMessageResponse message) {
        String key = CHAT_ROOM_PREFIX + sessionId + ":messages";
        redisTemplate.opsForList().rightPush(key, message);

        // Cắt tỉa: Chỉ giữ lại 50 tin nhắn mới nhất để không làm tràn RAM
        redisTemplate.opsForList().trim(key, -MAX_HISTORY_MESSAGES, -1);

        // Reset thời gian sống (TTL) của phòng chat thêm 2 tiếng
        redisTemplate.expire(key, Duration.ofHours(2));
    }

    // Lấy lịch sử chat từ Cache
    public List<Object> getRecentMessagesFromCache(Long sessionId) {
        String key = CHAT_ROOM_PREFIX + sessionId + ":messages";
        return redisTemplate.opsForList().range(key, 0, -1);
    }
}