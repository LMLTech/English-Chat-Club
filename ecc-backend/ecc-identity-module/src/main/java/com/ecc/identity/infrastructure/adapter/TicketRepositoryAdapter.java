package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.TicketRepositoryPort;
import com.ecc.identity.domain.model.SupportTicket;
import com.ecc.identity.domain.model.TicketMessage;
import com.ecc.identity.infrastructure.repository.SupportTicketRepository;
import com.ecc.identity.infrastructure.repository.TicketMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TicketRepositoryAdapter implements TicketRepositoryPort {

    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;

    @Override
    public SupportTicket saveTicket(SupportTicket ticket) {
        return ticketRepository.save(ticket);
    }

    @Override
    public TicketMessage saveMessage(TicketMessage message) {
        return messageRepository.save(message);
    }

    @Override
    public Optional<SupportTicket> findTicketByUuid(String uuid) {
        return ticketRepository.findByUuid(uuid);
    }

    @Override
    public List<SupportTicket> findAllTickets() {
        return ticketRepository.findAll();
    }

    @Override
    public List<SupportTicket> findTicketsByStatus(String status) {
        // Cần thêm hàm findByStatus(String status) vào interface SupportTicketRepository của JPA
        return ticketRepository.findByStatus(status);
    }
}
