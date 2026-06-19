package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.Session;
import java.util.Optional;

public interface SessionRepositoryPort {
    Session save(Session session);
    Optional<Session> findById(Long id);
}