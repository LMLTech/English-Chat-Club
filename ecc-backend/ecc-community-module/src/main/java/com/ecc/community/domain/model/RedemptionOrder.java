package com.ecc.community.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "redemption_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedemptionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private UUID uuid;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_item_id", nullable = false)
    private RewardItem rewardItem;

    @Column(name = "address_id")
    private Long addressId; // Chỉ lưu ID vì bảng user_addresses nằm ở Identity module

    @Column(name = "points_deducted", nullable = false)
    private Integer pointsDeducted;

    @Column(nullable = false, length = 20)
    private String status; // PROCESSING, SHIPPED, DELIVERED, CANCELLED

    @Column(name = "tracking_code", length = 100)
    private String trackingCode;

    @Column(name = "ordered_at", nullable = false, updatable = false)
    private LocalDateTime orderedAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @PrePersist
    public void generateUuid() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
    }
}