package com.ecc.session.application.port.in;

import com.ecc.session.api.dto.request.WebRTCSignalRequest;

public interface ManageSignalUseCase {
    void forwardSignal(String sessionId, WebRTCSignalRequest request);
}
