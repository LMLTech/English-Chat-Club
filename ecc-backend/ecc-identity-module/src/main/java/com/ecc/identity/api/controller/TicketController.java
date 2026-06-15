package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.request.TicketMessageRequest;
import com.ecc.identity.api.dto.request.TicketRequest;
import com.ecc.identity.application.port.in.ManageTicketUseCase;
import com.ecc.identity.domain.model.SupportTicket;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final ManageTicketUseCase manageTicketUseCase;

    // Helper method để lấy User ID từ Spring Security Context
    private Long getCurrentUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> createTicket(
            @RequestBody TicketRequest request,
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);
        manageTicketUseCase.createTicket(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo ticket thành công"));
    }

    @PostMapping("/{uuid}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> replyTicket(
            @PathVariable String uuid,
            @RequestBody TicketMessageRequest request,
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);
        manageTicketUseCase.replyTicket(userId, uuid, request);
        return ResponseEntity.ok(ApiResponse.success("Gửi phản hồi thành công"));
    }

    // API ADMIN
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getTickets(
            @RequestParam(required = false) String status) {

        List<SupportTicket> tickets = manageTicketUseCase.getTicketsForAdmin(status);
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @PutMapping("/{uuid}/close")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> closeTicket(@PathVariable String uuid) {
        manageTicketUseCase.closeTicket(uuid);
        return ResponseEntity.ok(ApiResponse.success("Đã đóng ticket"));
    }
}