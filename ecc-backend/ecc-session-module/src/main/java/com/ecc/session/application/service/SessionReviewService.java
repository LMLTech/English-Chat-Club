package com.ecc.session.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.session.api.dto.request.CreateReviewRequest;
import com.ecc.session.domain.model.Session;
import com.ecc.session.domain.model.SessionReview;
import com.ecc.session.application.port.out.SessionRepositoryPort;
import com.ecc.session.application.port.out.SessionReviewRepositoryPort;
import com.ecc.session.application.port.in.ManageSessionReviewUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionReviewService implements ManageSessionReviewUseCase {

    private final SessionReviewRepositoryPort sessionReviewRepository;
    private final SessionRepositoryPort sessionRepository;
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

    @Override
    @Transactional(readOnly = true)
    public java.util.List<com.ecc.session.api.dto.response.ReviewResponse> getReviewsForModerator(Long moderatorId) {
        java.util.List<Session> sessions = sessionRepository.findAll().stream()
                .filter(s -> moderatorId.equals(s.getModeratorId()))
                .collect(java.util.stream.Collectors.toList());

        java.util.List<Long> sessionIds = sessions.stream()
                .map(Session::getId)
                .collect(java.util.stream.Collectors.toList());

        if (sessionIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        java.util.List<SessionReview> reviews = sessionReviewRepository.findBySessionIdIn(sessionIds);

        return reviews.stream().map(r -> {
            String title = sessions.stream()
                    .filter(s -> s.getId().equals(r.getSessionId()))
                    .map(Session::getTitle)
                    .findFirst()
                    .orElse("Unknown Session");
            
            // Tìm tên user, ở đây do không inject Identity Module nên dùng JDBC lấy tên học viên (nếu cùng DB)
            String userName = "Học viên";
            try {
                userName = jdbcTemplate.queryForObject("SELECT full_name FROM users WHERE id = ?", String.class, r.getReviewerId());
            } catch (Exception e) {
                log.warn("Không tìm thấy tên user {}", r.getReviewerId());
            }
            
            return com.ecc.session.api.dto.response.ReviewResponse.fromEntity(r, title, userName);
        }).collect(java.util.stream.Collectors.toList());
    }
}