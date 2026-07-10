package com.ecc.identity.infrastructure.repository;

import com.ecc.identity.domain.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByActorIdOrderByTimestampDesc(Long actorId, Pageable pageable);
    Page<AuditLog> findByActionOrderByTimestampDesc(String action, Pageable pageable);
    Page<AuditLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
}