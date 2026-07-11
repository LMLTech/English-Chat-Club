package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.SessionReviewRepositoryPort;
import com.ecc.session.domain.model.SessionReview;
import com.ecc.session.infrastructure.repository.SessionReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SessionReviewRepositoryAdapter implements SessionReviewRepositoryPort {

    private final SessionReviewRepository repository;

    @Override
    public SessionReview save(SessionReview entity) {
        return repository.save(entity);
    }

    @Override
    public Optional<SessionReview> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<SessionReview> findAll() {
        return repository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
    
    @Override
    public void delete(SessionReview entity) {
        repository.delete(entity);
    }

    @Override
    public boolean existsBySessionIdAndReviewerId(Long sessionId, Long reviewerId) {
        return repository.existsBySessionIdAndReviewerId(sessionId, reviewerId);
    }
}
