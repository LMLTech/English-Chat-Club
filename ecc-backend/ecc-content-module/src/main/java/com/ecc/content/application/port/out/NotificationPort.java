package com.ecc.content.application.port.out;

import com.ecc.content.domain.model.InAppNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface NotificationPort {
    InAppNotification save(InAppNotification notification);
    List<InAppNotification> saveAll(List<InAppNotification> notifications);
    Optional<InAppNotification> findByIdAndUserId(Long id, Long userId);
    Page<InAppNotification> findByUserId(Long userId, Pageable pageable);
    Page<InAppNotification> findByUserIdAndIsReadFalse(Long userId, Pageable pageable);
    List<InAppNotification> findAllUnreadByUserId(Long userId);
}