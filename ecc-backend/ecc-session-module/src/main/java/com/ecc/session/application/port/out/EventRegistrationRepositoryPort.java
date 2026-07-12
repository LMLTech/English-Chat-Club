package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.EventRegistration;
import java.util.Optional;
import java.util.List;

public interface EventRegistrationRepositoryPort {
    EventRegistration save(EventRegistration entity);
    Optional<EventRegistration> findById(Long id);
    List<EventRegistration> findAll();
    void deleteById(Long id);
    void delete(EventRegistration entity);
    boolean existsByEventAndUserId(com.ecc.session.domain.model.Event event, Long userId);
    Optional<EventRegistration> findByEventAndUserId(com.ecc.session.domain.model.Event event, Long userId);
}
