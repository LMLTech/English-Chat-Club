package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.request.SupportTicketReplyRequest;
import com.ecc.identity.application.service.SupportTicketService;
import com.ecc.identity.domain.model.SupportTicket;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/support-tickets")
@RequiredArgsConstructor
public class AdminSupportController {

    private final SupportTicketService supportTicketService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getAllTickets() {
        List<SupportTicket> tickets = supportTicketService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @PostMapping("/{id}/reply")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<SupportTicket>> replyTicket(
            @PathVariable Long id,
            @Valid @RequestBody SupportTicketReplyRequest request) {

        SupportTicket ticket = supportTicketService.replyTicket(id, request);
        return ResponseEntity.ok(ApiResponse.success(ticket));
    }
}
