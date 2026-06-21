package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.api.dto.response.ChatMessageResponse;
import com.ecc.session.domain.model.ChatMessage;
import com.ecc.session.infrastructure.adapter.ChatMessageRedisAdapter;
import com.ecc.session.infrastructure.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sessions/{sessionId}/messages")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatMessageRedisAdapter chatMessageRedisAdapter;
    private final ChatMessageRepository chatMessageRepository;

    /**
     * API để lúc mới vào phòng, Client gọi để load 50 tin nhắn cũ siêu tốc từ Redis
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()") // Hoặc kiểm tra chi tiết quyền hơn tùy nhu cầu
    public ResponseEntity<ApiResponse<List<Object>>> getChatHistory(@PathVariable Long sessionId) {
        List<Object> history = chatMessageRedisAdapter.getRecentMessagesFromCache(sessionId);
        
        if (history == null || history.isEmpty()) {
            // Fallback to MySQL
            List<ChatMessage> dbMessages = chatMessageRepository.findTop50BySessionIdOrderByCreatedAtDesc(sessionId);
            
            // Re-populate cache and return
            List<Object> responseList = dbMessages.stream()
                .filter(m -> m.getDeletedAt() == null) // Bỏ qua tin nhắn đã xóa
                .sorted((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt())) // Sắp xếp cũ -> mới
                .map(m -> {
                    ChatMessageResponse response = ChatMessageResponse.builder()
                            .uuid(m.getUuid().toString())
                            .sessionId(m.getSession().getId())
                            .senderId(m.getSenderId())
                            .content(m.getContent())
                            .type(m.getType())
                            .createdAt(m.getCreatedAt())
                            .deletedAt(m.getDeletedAt())
                            .isPinned(m.getIsPinned())
                            .build();
                    chatMessageRedisAdapter.saveMessageToCache(sessionId, response);
                    return (Object) response;
                }).collect(Collectors.toList());
                
            return ResponseEntity.ok(ApiResponse.success(responseList));
        }

        // Nếu có cache, cũng cần lọc tin nhắn đã xóa (phòng trường hợp cache chưa update)
        // Tuy nhiên do history lưu dưới dạng Map (do Jackson deserialize), ta có thể trả về luôn
        // vì khi xóa ta sẽ xóa hẳn cache.
        
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}