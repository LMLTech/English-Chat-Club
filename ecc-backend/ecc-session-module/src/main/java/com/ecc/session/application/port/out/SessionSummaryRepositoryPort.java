package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.SessionSummary;
import java.util.Optional;
import java.util.List;

public interface SessionSummaryRepositoryPort {
    SessionSummary save(SessionSummary entity);
    Optional<SessionSummary> findById(Long id);
    List<SessionSummary> findAll();
    void deleteById(Long id);
    void delete(SessionSummary entity);
}
