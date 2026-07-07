package com.ecc.content.application.port.in;

import com.ecc.content.domain.model.InAppNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationUseCase {
    void createNotification(Long userId, String type, String title, String message);
    Page<InAppNotification> getUserNotifications(Long userId, Pageable pageable);
    Page<InAppNotification> getUnreadUserNotifications(Long userId, Pageable pageable);
    void markAsRead(Long userId, Long notificationId);
    void markAllAsRead(Long userId);
}