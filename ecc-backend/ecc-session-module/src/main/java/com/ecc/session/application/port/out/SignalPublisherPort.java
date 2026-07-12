package com.ecc.session.application.port.out;

import com.ecc.session.api.dto.request.WebRTCSignalRequest;

public interface SignalPublisherPort {
    void publishSignal(String destination, WebRTCSignalRequest request);
}
