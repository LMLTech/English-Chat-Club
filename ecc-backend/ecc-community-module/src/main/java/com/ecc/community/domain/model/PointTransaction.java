package com.ecc.community.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Ghi nhận mỗi lần điểm thay đổi (audit log).
 * Dùng để hiển thị lịch sử điểm cho user.
 */
@Entity
@Table(name = "point_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // userId từ ecc-identity-module
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Số điểm thay đổi (dương = cộng, âm = trừ)
    @Column(nullable = false)
    private Integer points;

    // Lý do: SESSION_COMPLETED, VOCABULARY_PRAISED, REFERRAL_REWARD, LATE_CANCEL, BADGE_BONUS
    @Column(nullable = false, length = 50)
    private String reason;

    // Mô tả chi tiết (ví dụ: "Session #42 - 125 giây phát biểu")
    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "occurred_at", nullable = false, updatable = false)
    private LocalDateTime occurredAt;
}
