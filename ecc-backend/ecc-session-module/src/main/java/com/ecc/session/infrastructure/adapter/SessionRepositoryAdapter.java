package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.SessionRepositoryPort;
import com.ecc.session.domain.model.Session;
import com.ecc.session.infrastructure.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SessionRepositoryAdapter implements SessionRepositoryPort {

    private final SessionRepository sessionRepository;

    @Override
    public Session save(Session session) {
        return sessionRepository.save(session);
    }

    @Override
    public Optional<Session> findById(Long id) {
        return sessionRepository.findById(id);
    }

    @Override
    public List<Session> findAll() {
        return sessionRepository.findAll();
    }

    @Override
    public List<Session> findByEndTimeBeforeAndStatusIn(LocalDateTime endTime, List<String> statuses) {
        return sessionRepository.findByEndTimeBeforeAndStatusIn(endTime, statuses);
    }

    @Override
    public int tryIncrementParticipants(Long sessionId) {
        return sessionRepository.tryIncrementParticipants(sessionId);
    }

    @Override
    public int tryDecrementParticipants(Long sessionId) {
        return sessionRepository.tryDecrementParticipants(sessionId);
    }

    @Override
    public boolean hasConflictingBooking(Long memberId, LocalDateTime startTime, LocalDateTime endTime, Long excludeSessionId) {
        return sessionRepository.hasConflictingBooking(memberId, startTime, endTime, excludeSessionId);
    }
}
