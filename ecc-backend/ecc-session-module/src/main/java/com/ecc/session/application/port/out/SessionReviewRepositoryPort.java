package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.SessionReview;
import java.util.Optional;
import java.util.List;

public interface SessionReviewRepositoryPort {
    SessionReview save(SessionReview entity);
    Optional<SessionReview> findById(Long id);
    List<SessionReview> findAll();
    void deleteById(Long id);
    void delete(SessionReview entity);
    boolean existsBySessionIdAndReviewerId(Long sessionId, Long reviewerId);
}
