package com.ecc.session.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.session.api.dto.request.CreateReviewRequest;
import com.ecc.session.domain.model.Session;
import com.ecc.session.domain.model.SessionReview;
import com.ecc.session.infrastructure.repository.SessionRepository;
import com.ecc.session.infrastructure.repository.SessionReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionReviewService {

    private final SessionReviewRepository sessionReviewRepository;
    private final SessionRepository sessionRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public void createReview(Long sessionId, Long reviewerId, CreateReviewRequest request) {
        // 1. Kiểm tra phòng tồn tại không
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Phòng chat không tồn tại"));

        // 2. Chống spam: Mỗi người chỉ được review 1 lần cho 1 phòng
        if (sessionReviewRepository.existsBySessionIdAndReviewerId(sessionId, reviewerId)) {
            throw new BadRequestException("Bạn đã đánh giá phòng học này rồi!");
        }

        // 3. Logic THẬT: Kiểm tra User có thực sự tham gia phòng không
        // Phải có record trong bảng bookings với status là CONFIRMED hoặc ATTENDED
        String sql = "SELECT COUNT(*) FROM bookings WHERE session_id = ? AND member_id = ? AND status IN ('CONFIRMED', 'ATTENDED')";
        Integer bookingCount = jdbcTemplate.queryForObject(sql, Integer.class, sessionId, reviewerId);

        if (bookingCount == null || bookingCount == 0) {
            log.warn("User {} cố gắng review Session {} nhưng không có vé tham gia.", reviewerId, sessionId);
            throw new BadRequestException("Bạn phải tham gia phòng học này thì mới được phép đánh giá!");
        }

        // 4. Lưu đánh giá xuống DB
        SessionReview review = SessionReview.builder()
                .sessionId(sessionId)
                .reviewerId(reviewerId)
                .moderatorRating(request.getModeratorRating())
                .topicRating(request.getTopicRating())
                .comment(request.getComment())
                .build();

        sessionReviewRepository.save(review);
        log.info("User {} đã gửi đánh giá thành công cho Session {}", reviewerId, sessionId);
    }
}