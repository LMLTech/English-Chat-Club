package com.ecc.session.api.websocket;

import com.ecc.common.exception.BadRequestException;
import com.ecc.session.api.dto.request.HandSignalRequest;
import com.ecc.session.api.dto.response.HandSignalResponse;
import com.ecc.session.domain.model.Session;
import com.ecc.session.infrastructure.repository.SessionRepository;
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
    private final SessionRepository sessionRepository;

    @MessageMapping("/session.handSignal/{sessionId}")
    public void handleHandSignal(@DestinationVariable Long sessionId,
                                 @Payload HandSignalRequest request,
                                 SimpMessageHeaderAccessor headerAccessor) {
        try {
            Long senderId = Long.parseLong(headerAccessor.getUser().getName());

            Session session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new BadRequestException("Phòng không tồn tại"));

            boolean isModerator = session.getModeratorId().equals(senderId);
            Long affectedUserId = senderId; // Mặc định là tự mình thao tác
            String displayMessage = "";

            if (request.getAction().equals("APPROVE") || request.getAction().equals("REJECT") || request.getAction().equals("MUTE")) {
                if (!isModerator) {
                    throw new BadRequestException("Chỉ Moderator mới có quyền cấp hoặc tắt Mic.");
                }
                affectedUserId = request.getTargetUserId();
                displayMessage = "Moderator đã " + request.getAction() + " mic của User " + affectedUserId;
            } else {
                // Hành động RAISE (giơ tay) hoặc LOWER (hạ tay)
                displayMessage = "User " + affectedUserId + " đã " + request.getAction() + " tay.";
            }

            HandSignalResponse response = HandSignalResponse.builder()
                    .sessionId(sessionId)
                    .userId(affectedUserId)
                    .action(request.getAction())
                    .message(displayMessage)
                    .build();

            // Broadcast tín hiệu cho toàn phòng (Frontend sẽ dựa vào tín hiệu này để mở mic / hiện icon bàn tay)
            messagingTemplate.convertAndSend("/topic/chat/" + sessionId, response);

        } catch (Exception e) {
            log.error("Lỗi Hand Signal phòng {}: {}", sessionId, e.getMessage(), e);
        }
    }
}