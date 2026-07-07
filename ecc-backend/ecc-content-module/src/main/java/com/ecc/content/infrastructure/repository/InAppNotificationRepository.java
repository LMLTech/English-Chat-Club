package com.ecc.content.infrastructure.repository;

import com.ecc.content.domain.model.InAppNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InAppNotificationRepository extends JpaRepository<InAppNotification, Long> {
    Page<InAppNotification> findByUserId(Long userId, Pageable pageable);
    Page<InAppNotification> findByUserIdAndIsReadFalse(Long userId, Pageable pageable);
    List<InAppNotification> findByUserIdAndIsReadFalse(Long userId);
    Optional<InAppNotification> findByIdAndUserId(Long id, Long userId);
}