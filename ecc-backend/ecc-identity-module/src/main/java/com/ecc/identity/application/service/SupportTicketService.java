package com.ecc.identity.application.service;

import com.ecc.common.event.SupportTicketResolvedEvent;
import com.ecc.common.exception.ResourceNotFoundException;
import com.ecc.identity.api.dto.request.SupportTicketReplyRequest;
import com.ecc.identity.api.dto.request.SupportTicketRequest;
import com.ecc.identity.domain.model.SupportTicket;
import com.ecc.identity.domain.model.User;
import com.ecc.identity.infrastructure.repository.SupportTicketRepository;
import com.ecc.identity.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public SupportTicket createTicket(Long userId, SupportTicketRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        SupportTicket ticket = new SupportTicket();
        ticket.setUuid(UUID.randomUUID());
        ticket.setUser(user);
        ticket.setSubject(request.getSubject());
        ticket.setContent(request.getContent());
        ticket.setCategory(request.getCategory());
        ticket.setStatus("OPEN");
        ticket.setPriority("MEDIUM");

        log.info("User {} created support ticket: {}", userId, request.getSubject());
        return supportTicketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<SupportTicket> getUserTickets(Long userId) {
        return supportTicketRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<SupportTicket> getAllTickets() {
        return supportTicketRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public SupportTicket replyTicket(Long ticketId, SupportTicketReplyRequest request) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ticket"));

        ticket.setReplyMessage(request.getReplyMessage());
        ticket.setStatus("RESOLVED");

        SupportTicket savedTicket = supportTicketRepository.save(ticket);

        log.info("Admin replied to ticket {}: {}", ticketId, request.getReplyMessage());

        // Publish event để NotificationService gửi thông báo cho Member
        eventPublisher.publishEvent(new SupportTicketResolvedEvent(
                savedTicket.getUserId(),
                savedTicket.getId(),
                savedTicket.getSubject(),
                savedTicket.getReplyMessage()
        ));

        return savedTicket;
    }
}
