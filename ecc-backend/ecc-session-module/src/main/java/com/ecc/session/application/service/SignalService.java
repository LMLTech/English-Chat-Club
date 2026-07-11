package com.ecc.session.application.service;

import com.ecc.session.api.dto.request.WebRTCSignalRequest;
import com.ecc.session.application.port.in.ManageSignalUseCase;
import com.ecc.session.application.port.out.SignalPublisherPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SignalService implements ManageSignalUseCase {

    private final SignalPublisherPort signalPublisherPort;

    @Override
    public void forwardSignal(String sessionId, WebRTCSignalRequest request) {
        String destination = "/topic/room/" + sessionId + "/signal";
        signalPublisherPort.publishSignal(destination, request);
    }
}
