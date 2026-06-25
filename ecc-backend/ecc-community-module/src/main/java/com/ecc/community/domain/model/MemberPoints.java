package com.ecc.community.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Lưu tổng điểm và cấp độ hiện tại của mỗi thành viên.
 * Dùng @Version để tránh race condition khi nhiều event cùng cộng điểm (Optimistic Lock).
 */
@Entity
@Table(name = "member_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberPoints {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Lưu userId từ ecc-identity-module (không dùng @ManyToOne để tránh phụ thuộc module chéo)
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Builder.Default
    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 0;

    @Builder.Default
    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 1;

    // Optimistic Lock: tránh cập nhật điểm đè nhau khi có nhiều event đồng thời
    @Version
    @Column(nullable = false)
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
