package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.SessionRepositoryPort;
import com.ecc.session.domain.model.Session;
import com.ecc.session.infrastructure.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

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
}