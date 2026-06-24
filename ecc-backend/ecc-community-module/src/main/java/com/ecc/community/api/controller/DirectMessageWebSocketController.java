package com.ecc.community.api.controller;

import com.ecc.community.api.dto.request.friend.DirectMessageRequest;
import com.ecc.community.api.dto.response.friend.DirectMessageResponse;
import com.ecc.community.application.service.DirectMessageService;
import com.ecc.community.domain.model.friend.DirectMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class DirectMessageWebSocketController {

    private final DirectMessageService directMessageService;

    /**
     * Endpoint WebSocket cho nhắn tin trực tiếp.
     * Client gửi message tới đích: /app/direct/{receiverId}
     * Ví dụ: /app/direct/2
     */
    @MessageMapping("/direct/{receiverId}")
    public void sendDirectMessage(
            @DestinationVariable Long receiverId,
            @Payload DirectMessageRequest request,
            Principal principal
    ) {
        if (principal == null || principal.getName() == null) {
            log.warn("WebSocket message received without authentication");
            return;
        }

        Long senderId = Long.parseLong(principal.getName());
        
        try {
            // Service sẽ kiểm tra FriendRequest, lưu DB, đẩy qua SimpMessagingTemplate tới /user/{receiverId}/queue/direct
            // và publish Event nếu user offline
            DirectMessage message = directMessageService.sendDirectMessage(
                    senderId, 
                    receiverId, 
                    request.getContent(), 
                    request.getAttachmentUrl()
            );
            
            log.info("User {} sent direct message to User {}", senderId, receiverId);
        } catch (SecurityException e) {
            log.error("User {} is not friend with User {} - Message discarded", senderId, receiverId);
        } catch (Exception e) {
            log.error("Error sending direct message via WebSocket", e);
        }
    }
}
