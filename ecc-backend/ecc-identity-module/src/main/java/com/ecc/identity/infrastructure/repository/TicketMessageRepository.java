package com.ecc.identity.infrastructure.repository;

import com.ecc.identity.domain.model.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {

    // Tìm tất cả tin nhắn của một ticket
    List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
