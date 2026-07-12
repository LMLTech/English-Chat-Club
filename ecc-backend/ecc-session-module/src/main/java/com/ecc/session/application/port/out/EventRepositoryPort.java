package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.Event;
import java.util.Optional;
import java.util.List;

public interface EventRepositoryPort {
    Event save(Event entity);
    Optional<Event> findById(Long id);
    List<Event> findAll();
    void deleteById(Long id);
    void delete(Event entity);
}
