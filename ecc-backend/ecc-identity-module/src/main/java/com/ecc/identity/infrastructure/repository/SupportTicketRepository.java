package com.ecc.identity.infrastructure.repository;

import com.ecc.identity.domain.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    Optional<SupportTicket> findByUuid(String uuid);
    List<SupportTicket> findByStatus(String status);
}