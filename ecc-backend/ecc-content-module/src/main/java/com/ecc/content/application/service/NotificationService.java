package com.ecc.content.application.service;

import com.ecc.content.application.port.in.NotificationUseCase;
import com.ecc.content.application.port.out.NotificationPort;
import com.ecc.content.domain.model.InAppNotification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService implements NotificationUseCase {

    private final NotificationPort notificationPort;

    @Override
    @Transactional
    public void createNotification(Long userId, String type, String title, String message) {
        InAppNotification notification = InAppNotification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .build();

        notificationPort.save(notification);
        log.info("[Notification] Đã tạo thông báo '{}' cho User {}", title, userId);

        // Tương lai: Tích hợp WebSocket gửi real-time xuống client tại đây
        // simpMessagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InAppNotification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationPort.findByUserId(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InAppNotification> getUnreadUserNotifications(Long userId, Pageable pageable) {
        return notificationPort.findByUserIdAndIsReadFalse(userId, pageable);
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        InAppNotification notification = notificationPort.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông báo"));

        if (!notification.isRead()) {
            notification.markAsRead();
            notificationPort.save(notification);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<InAppNotification> unreadList = notificationPort.findAllUnreadByUserId(userId);
        unreadList.forEach(InAppNotification::markAsRead);
        notificationPort.saveAll(unreadList);
        log.info("[Notification] User {} đã đọc tất cả thông báo", userId);
    }
}