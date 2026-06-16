package com.ecc.identity.application.port.in;

import com.ecc.identity.api.dto.request.TicketMessageRequest;
import com.ecc.identity.api.dto.request.TicketRequest;
import com.ecc.identity.domain.model.SupportTicket;

public interface ManageTicketUseCase {
    void createTicket(Long userId, TicketRequest request);
    void replyTicket(Long userId, String ticketUuid, TicketMessageRequest request);
    void closeTicket(String ticketUuid);
    java.util.List<SupportTicket> getTicketsForAdmin(String status);
}
