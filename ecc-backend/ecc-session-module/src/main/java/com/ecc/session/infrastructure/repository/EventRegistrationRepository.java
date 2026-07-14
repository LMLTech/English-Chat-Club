package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.Event;
import com.ecc.session.domain.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    Optional<EventRegistration> findByEventAndUserId(Event event, Long userId);
    List<EventRegistration> findByUserId(Long userId);
    List<EventRegistration> findByEvent_Id(Long eventId);
    boolean existsByEventAndUserId(Event event, Long userId);
}
