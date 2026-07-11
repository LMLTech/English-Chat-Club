package com.ecc.session.api.websocket;

import com.ecc.session.api.dto.request.ChatMessageRequest;
import com.ecc.session.api.dto.response.ChatMessageResponse;
import com.ecc.session.application.port.in.ManageChatUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ManageChatUseCase chatService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Lắng nghe tin nhắn từ Client gửi đến: /app/chat.sendMessage/{sessionId}
     */
    @MessageMapping("/chat.sendMessage/{sessionId}")
    public void sendMessage(@DestinationVariable Long sessionId,
                            @Payload ChatMessageRequest request,
                            SimpMessageHeaderAccessor headerAccessor) {
        try {
            // Lấy ID người gửi từ JWT đã được interceptor bóc tách
            Long senderId = Long.parseLong(headerAccessor.getUser().getName());

            // Xử lý lưu DB & Redis
            ChatMessageResponse response = chatService.processAndSaveMessage(sessionId, senderId, request);

            // Bắn tin nhắn lại cho toàn bộ những người đang subscribe kênh của phòng này
            messagingTemplate.convertAndSend("/topic/chat/" + sessionId, response);

        } catch (Exception e) {
            log.error("Lỗi khi gửi tin nhắn phòng {}: {}", sessionId, e.getMessage());
            // Có thể xử lý gửi lỗi ngược lại cho người gửi qua /queue/errors
        }
    }
}