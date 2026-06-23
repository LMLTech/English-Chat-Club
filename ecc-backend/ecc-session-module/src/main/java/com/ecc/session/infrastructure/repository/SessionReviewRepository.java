package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.SessionReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionReviewRepository extends JpaRepository<SessionReview, Long> {
    // Kiểm tra xem User đã từng review Session này chưa
    boolean existsBySessionIdAndReviewerId(Long sessionId, Long reviewerId);
}