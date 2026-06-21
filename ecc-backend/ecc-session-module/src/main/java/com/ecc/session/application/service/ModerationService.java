package com.ecc.session.application.service;

import com.ecc.common.event.VocabularyPraisedEvent;
import com.ecc.session.api.dto.request.VocabularyHighlightRequest;
import com.ecc.session.api.dto.request.WarnUserRequest;
import com.ecc.session.application.port.out.IdentityPort;
import com.ecc.session.domain.model.UserWarning;
import com.ecc.session.domain.model.VocabularyHighlight;
import com.ecc.session.infrastructure.repository.SessionSummaryRepository;
import com.ecc.session.infrastructure.repository.UserWarningRepository;
import com.ecc.session.infrastructure.repository.VocabularyHighlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModerationService {

    private final UserWarningRepository userWarningRepository;
    private final VocabularyHighlightRepository vocabularyHighlightRepository;
    private final SessionSummaryRepository sessionSummaryRepository;
    private final IdentityPort identityPort;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void warnUser(Long moderatorId, WarnUserRequest request) {
        // Lưu warning
        UserWarning warning = UserWarning.builder()
                .userId(request.getUserId())
                .sessionId(request.getSessionId())
                .reason(request.getReason())
                .build();
        userWarningRepository.save(warning);

        // Đếm số warning trong 30 ngày qua
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long warningCount = userWarningRepository.countByUserIdAndCreatedAtAfter(request.getUserId(), thirtyDaysAgo);

        // Nếu >= 3 warning, khóa tài khoản 24h
        if (warningCount >= 3) {
            log.info("User {} has {} warnings in the last 30 days. Locking account for 24h.", request.getUserId(), warningCount);
            identityPort.lockUser(request.getUserId(), "24h", "Vi phạm quy tắc phòng chat nhiều lần");
        }
    }

    @Transactional
    public void highlightVocabulary(Long moderatorId, VocabularyHighlightRequest request) {
        VocabularyHighlight highlight = VocabularyHighlight.builder()
                .sessionId(request.getSessionId())
                .userId(request.getUserId())
                .word(request.getWord())
                .meaning(request.getMeaning())
                .build();
        vocabularyHighlightRepository.save(highlight);

        // Publish event
        VocabularyPraisedEvent event = new VocabularyPraisedEvent(
                request.getSessionId(),
                moderatorId,
                request.getUserId(),
                request.getWord()
        );
        eventPublisher.publishEvent(event);
    }

    @Transactional
    public void createSessionSummary(Long sessionId, Long moderatorId, com.ecc.session.api.dto.request.SessionSummaryRequest request) {
        // Lưu summary
        com.ecc.session.domain.model.SessionSummary summary = com.ecc.session.domain.model.SessionSummary.builder()
                .sessionId(sessionId)
                .content(request.getContent())
                .build();
        
        sessionSummaryRepository.save(summary);
        
        log.info("Session {} summary created by Moderator {}. Content: {}", sessionId, moderatorId, request.getContent());
        log.info("[MOCK EMAIL] Sending session summary email to all attendees of session {}", sessionId);
    }
}
