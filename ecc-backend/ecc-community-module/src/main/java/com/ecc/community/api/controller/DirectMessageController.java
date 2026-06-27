package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.community.api.dto.response.DirectMessageResponse;
import com.ecc.community.application.service.DirectMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/direct-messages")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('MEMBER')")
public class DirectMessageController {

    private final DirectMessageService directMessageService;

    @GetMapping("/{friendId}")
    public ResponseEntity<ApiResponse<Page<DirectMessageResponse>>> getChatHistory(
            Authentication authentication,
            @PathVariable Long friendId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = Long.parseLong(authentication.getName());
        // Frontend often needs the latest messages first, and display bottom-up.
        // The repository is already ordering by createdAt DESC.
        Pageable pageable = PageRequest.of(page, size);
        Page<DirectMessageResponse> history = directMessageService.getChatHistory(userId, friendId, pageable)
                .map(DirectMessageResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PutMapping("/{messageId}/recall")
    public ResponseEntity<ApiResponse<String>> recallMessage(
            Authentication authentication,
            @PathVariable Long messageId
    ) {
        Long senderId = Long.parseLong(authentication.getName());
        directMessageService.recallMessage(senderId, messageId);
        return ResponseEntity.ok(ApiResponse.success("Đã thu hồi tin nhắn"));
    }
}
