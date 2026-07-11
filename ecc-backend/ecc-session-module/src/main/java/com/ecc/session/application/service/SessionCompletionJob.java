package com.ecc.session.application.service;

import com.ecc.common.event.SessionCompletedEvent;
import com.ecc.session.domain.model.Session;
import com.ecc.session.application.port.out.SessionRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionCompletionJob {

    private final SessionRepositoryPort sessionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final JdbcTemplate jdbcTemplate;

    // Trả về đúng chuẩn: Chạy vào giây thứ 0 của mỗi phút
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void completeExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();

        List<Session> expiredSessions = sessionRepository.findByEndTimeBeforeAndStatusIn(
                now, List.of("SCHEDULED", "ONGOING")
        );

        if (expiredSessions.isEmpty()) {
            return;
        }

        log.info("BẮT ĐẦU CRON JOB: Phát hiện {} phòng học đã quá giờ. Tiến hành đóng phòng...", expiredSessions.size());

        for (Session session : expiredSessions) {
            session.setStatus("COMPLETED");
            sessionRepository.save(session);

            // 1. THỐNG KÊ VOICE: Tính tổng thời gian phát biểu
            String sqlVoice = "SELECT user_id, SUM(duration_seconds) FROM user_voice_records WHERE session_id = ? GROUP BY user_id";
            Map<Long, Integer> userSpeakingSeconds = new HashMap<>();

            jdbcTemplate.query(sqlVoice, rs -> {
                Long userId = rs.getLong(1);
                Integer totalSeconds = rs.getInt(2);
                userSpeakingSeconds.put(userId, totalSeconds != null ? totalSeconds : 0);
            }, session.getId());

            // 2. THỐNG KÊ TEXT CHAT: Đếm số lượng tin nhắn
            String sqlChat = "SELECT sender_id, COUNT(*) FROM chat_messages WHERE session_id = ? AND deleted_at IS NULL GROUP BY sender_id";
            Map<Long, Integer> userMessageCounts = new HashMap<>();

            jdbcTemplate.query(sqlChat, rs -> {
                Long userId = rs.getLong(1);
                Integer totalMessages = rs.getInt(2);
                userMessageCounts.put(userId, totalMessages != null ? totalMessages : 0);
            }, session.getId());

            // 3. Đóng gói Event ném đi và Log kết quả
            SessionCompletedEvent event = new SessionCompletedEvent(session.getId(), userSpeakingSeconds, userMessageCounts);
            eventPublisher.publishEvent(event);

            log.info("✅ Đã chốt sổ phòng ID: {}", session.getId());
            log.info("   -> Thống kê thời gian nói: {}", userSpeakingSeconds);
            log.info("   -> Thống kê lượng tin nhắn: {}", userMessageCounts);
        }
    }
}