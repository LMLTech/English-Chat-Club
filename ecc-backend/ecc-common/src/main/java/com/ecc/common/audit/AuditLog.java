package com.ecc.common.audit;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ Audit Log – ghi lại mọi hành động thay đổi dữ liệu
 * của Admin/Moderator vào bảng audit_logs.
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_actor_id", columnList = "actorId"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID người thực hiện hành động (Admin/Moderator). */
    @Column(nullable = false)
    private Long actorId;

    /** Role của người thực hiện (ADMIN, MODERATOR). */
    @Column(nullable = false, length = 50)
    private String actorRole;

    /** Tên hành động: BAN_USER, APPROVE_POST, ASSIGN_ROLE, v.v. */
    @Column(nullable = false, length = 100)
    private String action;

    /** Mô tả chi tiết hành động. */
    @Column(length = 500)
    private String description;

    /** Tên class.method đã được gọi. */
    @Column(nullable = false, length = 255)
    private String targetMethod;

    /** Tham số đầu vào (JSON). */
    @Column(columnDefinition = "TEXT")
    private String parameters;

    /** Kết quả trả về (success/failure). */
    @Column(length = 20)
    private String result;

    /** Chi tiết lỗi nếu failure. */
    @Column(columnDefinition = "TEXT")
    private String errorDetail;

    /** IP address của người thực hiện. */
    @Column(length = 50)
    private String ipAddress;

    /** Thời điểm thực hiện hành động. */
    @Column(nullable = false)
    private LocalDateTime timestamp;
}
