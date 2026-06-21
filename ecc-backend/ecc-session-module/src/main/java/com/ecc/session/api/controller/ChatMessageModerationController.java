package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.application.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatMessageModerationController {

    private final ChatService chatService;

    @DeleteMapping("/messages/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Long id, Authentication principal) {
        Long userId = Long.parseLong(principal.getName());
        chatService.deleteMessage(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/pin/{messageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> pinMessage(@PathVariable Long messageId, Authentication principal) {
        Long userId = Long.parseLong(principal.getName());
        chatService.pinMessage(messageId, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
