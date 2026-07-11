package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.EventRepositoryPort;
import com.ecc.session.domain.model.Event;
import com.ecc.session.infrastructure.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EventRepositoryAdapter implements EventRepositoryPort {

    private final EventRepository repository;

    @Override
    public Event save(Event entity) {
        return repository.save(entity);
    }

    @Override
    public Optional<Event> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Event> findAll() {
        return repository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
    
    @Override
    public void delete(Event entity) {
        repository.delete(entity);
    }
}
