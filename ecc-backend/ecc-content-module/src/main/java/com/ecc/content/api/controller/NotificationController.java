package com.ecc.content.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.content.api.dto.response.NotificationResponse;
import com.ecc.content.application.port.in.NotificationUseCase;
import com.ecc.content.domain.model.InAppNotification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationUseCase notificationUseCase;

    // 1. Lấy danh sách thông báo của User
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getMyNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = Long.parseLong(authentication.getName());
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<InAppNotification> notifications;
        if (unreadOnly) {
            notifications = notificationUseCase.getUnreadUserNotifications(userId, pageRequest);
        } else {
            notifications = notificationUseCase.getUserNotifications(userId, pageRequest);
        }

        Page<NotificationResponse> responsePage = notifications.map(this::mapToResponse);
        return ResponseEntity.ok(ApiResponse.success(responsePage));
    }

    // 2. Đánh dấu 1 thông báo là đã đọc
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId = Long.parseLong(authentication.getName());
        notificationUseCase.markAsRead(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đọc"));
    }

    // 3. Đánh dấu tất cả là đã đọc
    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        notificationUseCase.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đọc tất cả"));
    }

    private NotificationResponse mapToResponse(InAppNotification notif) {
        return NotificationResponse.builder()
                .id(notif.getId())
                .type(notif.getType())
                .title(notif.getTitle())
                .message(notif.getMessage())
                .isRead(notif.isRead())
                .createdAt(notif.getCreatedAt())
                .build();
    }
}