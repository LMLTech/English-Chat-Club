package com.ecc.identity.infrastructure.repository;

import com.ecc.identity.domain.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID; // Nhớ import UUID

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    // ĐÃ SỬA: Đổi String uuid thành UUID uuid
    Optional<SupportTicket> findByUuid(UUID uuid);

    List<SupportTicket> findByStatus(String status);
}