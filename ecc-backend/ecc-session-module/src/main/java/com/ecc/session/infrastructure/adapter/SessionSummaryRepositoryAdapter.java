package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.SessionSummaryRepositoryPort;
import com.ecc.session.domain.model.SessionSummary;
import com.ecc.session.infrastructure.repository.SessionSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SessionSummaryRepositoryAdapter implements SessionSummaryRepositoryPort {

    private final SessionSummaryRepository repository;

    @Override
    public SessionSummary save(SessionSummary entity) {
        return repository.save(entity);
    }

    @Override
    public Optional<SessionSummary> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<SessionSummary> findAll() {
        return repository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
    
    @Override
    public void delete(SessionSummary entity) {
        repository.delete(entity);
    }
}
