package com.ecc.content.infrastructure.adapter;

import com.ecc.content.application.port.out.NotificationPort;
import com.ecc.content.domain.model.InAppNotification;
import com.ecc.content.infrastructure.repository.InAppNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class NotificationAdapter implements NotificationPort {

    private final InAppNotificationRepository repository;

    @Override
    public InAppNotification save(InAppNotification notification) {
        return repository.save(notification);
    }

    @Override
    public List<InAppNotification> saveAll(List<InAppNotification> notifications) {
        return repository.saveAll(notifications);
    }

    @Override
    public Optional<InAppNotification> findByIdAndUserId(Long id, Long userId) {
        return repository.findByIdAndUserId(id, userId);
    }

    @Override
    public Page<InAppNotification> findByUserId(Long userId, Pageable pageable) {
        return repository.findByUserId(userId, pageable);
    }

    @Override
    public Page<InAppNotification> findByUserIdAndIsReadFalse(Long userId, Pageable pageable) {
        return repository.findByUserIdAndIsReadFalse(userId, pageable);
    }

    @Override
    public List<InAppNotification> findAllUnreadByUserId(Long userId) {
        return repository.findByUserIdAndIsReadFalse(userId);
    }
}