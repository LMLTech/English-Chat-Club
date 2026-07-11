package com.ecc.session.application.port.in;

import com.ecc.session.api.dto.request.VocabularyHighlightRequest;
import com.ecc.session.api.dto.request.WarnUserRequest;
import com.ecc.session.api.dto.request.SessionSummaryRequest;

public interface ManageModerationUseCase {
    void warnUser(Long moderatorId, WarnUserRequest request);
    void highlightVocabulary(Long moderatorId, VocabularyHighlightRequest request);
    void createSessionSummary(Long sessionId, Long moderatorId, SessionSummaryRequest request);
}
