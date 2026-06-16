package com.ecc.identity.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.common.exception.ResourceNotFoundException;
import com.ecc.identity.api.dto.request.TicketMessageRequest;
import com.ecc.identity.api.dto.request.TicketRequest;
import com.ecc.identity.application.port.in.ManageTicketUseCase;
import com.ecc.identity.application.port.out.TicketRepositoryPort;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.SupportTicket;
import com.ecc.identity.domain.model.TicketMessage;
import com.ecc.identity.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService implements ManageTicketUseCase {

    private final TicketRepositoryPort ticketRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;

    @Override
    @Transactional
    public void createTicket(Long userId, TicketRequest request) {
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        SupportTicket ticket = new SupportTicket();
        // Bỏ .toString() để lưu dưới dạng đối tượng UUID chuẩn (BINARY 16)
        ticket.setUuid(UUID.randomUUID());
        ticket.setUser(user);
        ticket.setSubject(request.getSubject());
        ticket.setCategory(request.getCategory() != null ? request.getCategory() : "OTHER");
        ticket.setStatus("OPEN");
        ticket.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");

        SupportTicket savedTicket = ticketRepositoryPort.saveTicket(ticket);

        TicketMessage message = new TicketMessage();
        message.setTicket(savedTicket);
        message.setSender(user);
        message.setMessage(request.getMessage());
        ticketRepositoryPort.saveMessage(message);
    }

    @Override
    @Transactional
    public void replyTicket(Long userId, String ticketUuid, TicketMessageRequest request) {
        User sender = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        SupportTicket ticket = ticketRepositoryPort.findTicketByUuid(ticketUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ticket"));

        if ("CLOSED".equals(ticket.getStatus())) {
            throw new BadRequestException("Không thể phản hồi ticket đã đóng");
        }

        TicketMessage message = new TicketMessage();
        message.setTicket(ticket);
        message.setSender(sender);
        message.setMessage(request.getMessage());
        ticketRepositoryPort.saveMessage(message);

        boolean isAdmin = "ADMIN".equals(sender.getRole());

        if (isAdmin && "OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
            ticketRepositoryPort.saveTicket(ticket);
        }
    }

    @Override
    @Transactional
    public void closeTicket(String ticketUuid) {
        SupportTicket ticket = ticketRepositoryPort.findTicketByUuid(ticketUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ticket"));

        ticket.setStatus("CLOSED");
        ticketRepositoryPort.saveTicket(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicket> getTicketsForAdmin(String status) {
        if (status != null && !status.isEmpty()) {
            return ticketRepositoryPort.findTicketsByStatus(status.toUpperCase());
        }
        return ticketRepositoryPort.findAllTickets();
    }
}