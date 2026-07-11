package com.ecc.session.api.websocket;

import com.ecc.common.exception.BadRequestException;
import com.ecc.session.api.dto.request.HandSignalRequest;
import com.ecc.session.api.dto.response.HandSignalResponse;
import com.ecc.session.application.port.in.ManageSessionUseCase;
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
public class SessionSignalWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ManageSessionUseCase manageSessionUseCase;

    @MessageMapping("/session.handSignal/{sessionId}")
    public void handleHandSignal(@DestinationVariable Long sessionId,
                                 @Payload HandSignalRequest request,
                                 SimpMessageHeaderAccessor headerAccessor) {
        try {
            Long senderId = Long.parseLong(headerAccessor.getUser().getName());

            HandSignalResponse response = manageSessionUseCase.handleHandSignal(sessionId, senderId, request);

            // Broadcast tín hiệu cho toàn phòng (Frontend sẽ dựa vào tín hiệu này để mở mic / hiện icon bàn tay)
            messagingTemplate.convertAndSend("/topic/chat/" + sessionId, response);

        } catch (Exception e) {
            log.error("Lỗi Hand Signal phòng {}: {}", sessionId, e.getMessage(), e);
        }
    }
}