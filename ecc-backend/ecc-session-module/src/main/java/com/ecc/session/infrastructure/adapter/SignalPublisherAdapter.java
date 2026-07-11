package com.ecc.session.infrastructure.adapter;

import com.ecc.session.api.dto.request.WebRTCSignalRequest;
import com.ecc.session.application.port.out.SignalPublisherPort;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SignalPublisherAdapter implements SignalPublisherPort {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void publishSignal(String destination, WebRTCSignalRequest request) {
        messagingTemplate.convertAndSend(destination, request);
    }
}
