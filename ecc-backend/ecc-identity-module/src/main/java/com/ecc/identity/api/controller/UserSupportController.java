package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.request.SupportTicketRequest;
import com.ecc.identity.application.service.SupportTicketService;
import com.ecc.identity.domain.model.SupportTicket;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/support-tickets")
@RequiredArgsConstructor
public class UserSupportController {

    private final SupportTicketService supportTicketService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SupportTicket>> createTicket(
            Authentication authentication,
            @Valid @RequestBody SupportTicketRequest request) {

        Long userId = Long.parseLong(authentication.getName());
        SupportTicket ticket = supportTicketService.createTicket(userId, request);
        return ResponseEntity.ok(ApiResponse.success(ticket));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getMyTickets(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        List<SupportTicket> tickets = supportTicketService.getUserTickets(userId);
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }
}
