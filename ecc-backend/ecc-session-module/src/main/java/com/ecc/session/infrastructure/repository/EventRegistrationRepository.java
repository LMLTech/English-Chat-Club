package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.Event;
import com.ecc.session.domain.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    Optional<EventRegistration> findByEventAndUserId(Event event, Long userId);
    boolean existsByEventAndUserId(Event event, Long userId);
}
