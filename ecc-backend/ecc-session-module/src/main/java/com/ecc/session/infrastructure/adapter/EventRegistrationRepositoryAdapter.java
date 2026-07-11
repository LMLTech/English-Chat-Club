package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.EventRegistrationRepositoryPort;
import com.ecc.session.domain.model.EventRegistration;
import com.ecc.session.infrastructure.repository.EventRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EventRegistrationRepositoryAdapter implements EventRegistrationRepositoryPort {

    private final EventRegistrationRepository repository;

    @Override
    public EventRegistration save(EventRegistration entity) {
        return repository.save(entity);
    }

    @Override
    public Optional<EventRegistration> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<EventRegistration> findAll() {
        return repository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
    
    @Override
    public void delete(EventRegistration entity) {
        repository.delete(entity);
    }

    @Override
    public boolean existsByEventAndUserId(com.ecc.session.domain.model.Event event, Long userId) {
        return repository.existsByEventAndUserId(event, userId);
    }

    @Override
    public Optional<EventRegistration> findByEventAndUserId(com.ecc.session.domain.model.Event event, Long userId) {
        return repository.findByEventAndUserId(event, userId);
    }
}
