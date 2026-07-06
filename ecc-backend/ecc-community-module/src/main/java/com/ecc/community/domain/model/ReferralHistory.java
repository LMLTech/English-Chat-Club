package com.ecc.community.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity(name = "CommunityReferralHistory")
@Table(name = "referral_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Giữ lỏng lẻo (Loose coupling) bằng cách lưu ID thay vì Map nguyên Object User của module khác
    @Column(name = "referrer_id", nullable = false)
    private Long referrerId;

    @Column(name = "referred_user_id", nullable = false, unique = true)
    private Long referredUserId;

    @Column(nullable = false, length = 20)
    private String status; // SIGNED_UP, ENROLLED, REWARDED

    @Column(name = "points_awarded", nullable = false)
    private Integer pointsAwarded;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}