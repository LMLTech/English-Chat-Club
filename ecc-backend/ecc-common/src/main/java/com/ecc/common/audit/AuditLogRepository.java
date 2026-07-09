package com.ecc.common.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * Repository cho AuditLog – hỗ trợ truy vấn lịch sử audit.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /** Tìm theo actorId (admin nào đã thực hiện). */
    Page<AuditLog> findByActorIdOrderByTimestampDesc(Long actorId, Pageable pageable);

    /** Tìm theo loại hành động. */
    Page<AuditLog> findByActionOrderByTimestampDesc(String action, Pageable pageable);

    /** Tìm theo khoảng thời gian. */
    Page<AuditLog> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime from, LocalDateTime to, Pageable pageable);

    /** Tìm tất cả, sắp xếp theo thời gian mới nhất. */
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
