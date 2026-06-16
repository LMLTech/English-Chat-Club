package com.ecc.identity.application.port.out;

import com.ecc.identity.domain.model.SupportTicket;
import com.ecc.identity.domain.model.TicketMessage;

import java.util.Optional;

public interface TicketRepositoryPort {
    SupportTicket saveTicket(SupportTicket ticket);
    TicketMessage saveMessage(TicketMessage message);
    Optional<SupportTicket> findTicketByUuid(String uuid);
    java.util.List<SupportTicket> findAllTickets();
    java.util.List<SupportTicket> findTicketsByStatus(String status);
}
