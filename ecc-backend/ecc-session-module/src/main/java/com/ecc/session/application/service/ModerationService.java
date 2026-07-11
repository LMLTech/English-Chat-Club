package com.ecc.session.application.service;

import com.ecc.common.event.VocabularyPraisedEvent;
import com.ecc.common.exception.BadRequestException;
import com.ecc.session.api.dto.request.VocabularyHighlightRequest;
import com.ecc.session.api.dto.request.WarnUserRequest;
import com.ecc.session.application.port.out.EmailPort;
import com.ecc.session.application.port.out.IdentityPort;
import com.ecc.session.domain.model.Session;
import com.ecc.session.domain.model.UserWarning;
import com.ecc.session.domain.model.VocabularyHighlight;
import com.ecc.session.application.port.out.SessionRepositoryPort;
import com.ecc.session.application.port.out.SessionSummaryRepositoryPort;
import com.ecc.session.application.port.out.UserWarningRepositoryPort;
import com.ecc.session.application.port.out.VocabularyHighlightRepositoryPort;
import com.ecc.session.application.port.in.ManageModerationUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModerationService implements ManageModerationUseCase {

    private final UserWarningRepositoryPort userWarningRepository;
    private final VocabularyHighlightRepositoryPort vocabularyHighlightRepository;
    private final SessionSummaryRepositoryPort sessionSummaryRepository;
    private final SessionRepositoryPort sessionRepository; // Dùng để tìm thông tin phòng
    private final IdentityPort identityPort;
    private final EmailPort emailPort; // Cổng gửi mail thật
    private final ApplicationEventPublisher eventPublisher;
    private final JdbcTemplate jdbcTemplate; // Dùng để query thẳng qua bảng users lấy email

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
        // 1. Kiểm tra phòng tồn tại để lấy tiêu đề gửi mail
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Phòng chat không tồn tại"));

        // 2. Lưu summary
        com.ecc.session.domain.model.SessionSummary summary = com.ecc.session.domain.model.SessionSummary.builder()
                .sessionId(sessionId)
                .content(request.getContent())
                .build();
        sessionSummaryRepository.save(summary);

        log.info("Session {} summary created by Moderator {}. Content: {}", sessionId, moderatorId, request.getContent());

        try {
            // Câu query lấy danh sách email của những người đã đặt chỗ (CONFIRMED) trong phòng này
            String sql = "SELECT u.email FROM users u " +
                    "JOIN bookings b ON u.id = b.member_id " +
                    "WHERE b.session_id = ? AND b.status = 'CONFIRMED'";

            List<String> attendeeEmails = jdbcTemplate.queryForList(sql, String.class, sessionId);

            // Bắn qua Adapter gửi mail
            emailPort.sendSessionSummary(attendeeEmails, session.getTitle(), request.getContent());
        } catch (Exception e) {
            log.error("Lỗi trong quá trình trích xuất email để gửi tổng kết: {}", e.getMessage());
        }
    }
}