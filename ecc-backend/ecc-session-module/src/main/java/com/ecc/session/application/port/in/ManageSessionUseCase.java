package com.ecc.session.application.port.in;

import com.ecc.session.api.dto.request.SessionRequest;
import com.ecc.session.api.dto.response.BookingResponse;
import com.ecc.session.domain.model.Session;

public interface ManageSessionUseCase {
    Session createSession(Long moderatorId, SessionRequest request);
    Session approveSession(Long sessionId);
    BookingResponse bookSession(Long memberId, Long sessionId, String memberStatus, String memberCefrLevel);
    BookingResponse cancelBooking(Long memberId, Long sessionId);
    BookingResponse confirmPromotion(Long memberId, Long sessionId);
}