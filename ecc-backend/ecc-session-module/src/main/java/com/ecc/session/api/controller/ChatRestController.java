package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.infrastructure.adapter.ChatMessageRedisAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sessions/{sessionId}/messages")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatMessageRedisAdapter chatMessageRedisAdapter;

    /**
     * API để lúc mới vào phòng, Client gọi để load 50 tin nhắn cũ siêu tốc từ Redis
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()") // Hoặc kiểm tra chi tiết quyền hơn tùy nhu cầu
    public ResponseEntity<ApiResponse<List<Object>>> getChatHistory(@PathVariable Long sessionId) {
        List<Object> history = chatMessageRedisAdapter.getRecentMessagesFromCache(sessionId);
        // Lưu ý: Nếu Redis trống, có thể phải query fallback từ MySQL
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}