package com.ecc.session.application.port.in;

import com.ecc.session.api.dto.request.SessionRequest;
import com.ecc.session.api.dto.response.BookingResponse;
import com.ecc.session.domain.model.Session;
import java.util.List;

public interface ManageSessionUseCase {
    Session createSession(Long moderatorId, SessionRequest request);
    Session approveSession(Long sessionId);
    BookingResponse bookSession(Long memberId, Long sessionId, String memberStatus, String memberCefrLevel);
    BookingResponse cancelBooking(Long memberId, Long sessionId);
    BookingResponse confirmPromotion(Long memberId, Long sessionId);
    List<Long> getBookedSessionIds(Long memberId);
    List<com.ecc.session.domain.model.VocabularyHighlight> getVocabulariesBySessionId(Long sessionId);
    List<Session> getAvailableSessions();
    List<Session> getPendingSessions();
    List<Session> getApprovedSessions();
    List<Session> getActiveSessions();
    List<Session> getModeratorSessions(Long moderatorId);
    com.ecc.session.api.dto.response.HandSignalResponse handleHandSignal(Long sessionId, Long senderId, com.ecc.session.api.dto.request.HandSignalRequest request);
}