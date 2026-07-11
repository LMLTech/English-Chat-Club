package com.ecc.session.api.websocket;

import com.ecc.session.api.dto.request.WebRTCSignalRequest;
import com.ecc.session.application.port.in.ManageSignalUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class SignalingWebSocketController {

    private final ManageSignalUseCase manageSignalUseCase;

    @MessageMapping("/signal.send/{sessionId}")
    public void sendSignal(@DestinationVariable String sessionId, WebRTCSignalRequest request) {
        // Forward the WebRTC signal using pure Hexagonal Architecture UseCase
        manageSignalUseCase.forwardSignal(sessionId, request);
    }
}
